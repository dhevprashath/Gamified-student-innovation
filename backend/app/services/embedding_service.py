import logging
from typing import Any, Dict, List, Optional
import numpy as np

logger = logging.getLogger("innoquest")

class EmbeddingService:
    _model = None
    _model_name = "sentence-transformers/all-MiniLM-L6-v2"
    _loading_error: Optional[str] = None

    @classmethod
    def load_model(cls) -> bool:
        """Loads the sentence-transformer model ONCE at startup."""
        if cls._model is not None:
            return True
        if cls._loading_error is not None:
            return False

        try:
            logger.info(f"Loading lightweight embedding model '{cls._model_name}'...")
            from sentence_transformers import SentenceTransformer
            cls._model = SentenceTransformer(cls._model_name)
            logger.info(f"Model '{cls._model_name}' loaded successfully.")
            return True
        except Exception as e:
            cls._loading_error = str(e)
            logger.error(f"Failed to load embedding model '{cls._model_name}': {e}")
            return False

    @classmethod
    def is_available(cls) -> bool:
        if cls._model is None:
            cls.load_model()
        return cls._model is not None

    @classmethod
    def format_idea_text(
        cls,
        title: str = "",
        description: str = "",
        problem_statement: str = "",
        proposed_solution: str = "",
        target_users: str = "",
        technology: str = ""
    ) -> str:
        """Formats student idea attributes into a single text representation for MiniLM."""
        desc = description or proposed_solution or ""
        sol = proposed_solution or description or ""
        return f"""Title: {title}
Description: {desc}
Problem: {problem_statement}
Solution: {sol}
Target Users: {target_users}
Technology: {technology}""".strip()

    @classmethod
    def get_embedding(cls, text: str) -> List[float]:
        """Generates a 384-dimensional embedding vector for the input text."""
        if not cls.is_available():
            raise RuntimeError(f"MiniLM model unavailable: {cls._loading_error}")
        
        try:
            embedding = cls._model.encode(text, convert_to_numpy=True)
            if isinstance(embedding, np.ndarray):
                return embedding.tolist()
            return list(embedding)
        except Exception as e:
            logger.error(f"Embedding generation error: {e}")
            raise RuntimeError(f"Failed to generate embedding: {e}")

    @classmethod
    def calculate_cosine_similarity(cls, vec1: List[float], vec2: List[float]) -> float:
        """Computes cosine similarity between two 384-dim vectors."""
        if not vec1 or not vec2 or len(vec1) != len(vec2):
            return 0.0
        v1 = np.array(vec1, dtype=np.float32)
        v2 = np.array(vec2, dtype=np.float32)
        
        norm1 = np.linalg.norm(v1)
        norm2 = np.linalg.norm(v2)
        
        if norm1 == 0 or norm2 == 0:
            return 0.0
            
        similarity = float(np.dot(v1, v2) / (norm1 * norm2))
        return max(-1.0, min(1.0, similarity))

    @classmethod
    def find_top_similar_ideas(
        cls,
        new_embedding: List[float],
        existing_records: List[Dict[str, Any]],
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """Compares the new embedding against existing stored idea embeddings."""
        if not new_embedding or not existing_records:
            return []

        results = []
        for rec in existing_records:
            rec_embedding = rec.get("embedding")
            if not rec_embedding or not isinstance(rec_embedding, list):
                # If existing record lacks embedding, skip or calculate dynamically if text available
                continue
                
            sim_score = cls.calculate_cosine_similarity(new_embedding, rec_embedding)
            # Bound similarity to 0..1 for UI display
            bounded_sim = max(0.0, round(sim_score, 4))
            
            results.append({
                "id": rec.get("id"),
                "project_id": rec.get("project_id"),
                "project_title": rec.get("project_title") or rec.get("title") or "Untitled Idea",
                "problem_statement": rec.get("problem_statement") or "",
                "proposed_solution": rec.get("proposed_solution") or rec.get("description") or "",
                "similarity_score": bounded_sim,
                "similarity_percentage": round(bounded_sim * 100, 1)
            })

        # Sort by similarity score descending
        results.sort(key=lambda x: x["similarity_score"], reverse=True)
        return results[:top_k]

    @classmethod
    def calculate_novelty_score(cls, max_similarity: float) -> Dict[str, Any]:
        """
        Calculates novelty score based on maximum similarity.
        High similarity -> lower novelty indicator.
        Low similarity -> higher novelty indicator.
        """
        # Linear/bounded scale: novelty = 100 - (max_similarity * 100)
        bounded_max_sim = max(0.0, min(1.0, max_similarity))
        novelty_score = round(max(0.0, min(100.0, (1.0 - bounded_max_sim) * 100)))
        
        if novelty_score >= 80:
            rating = "High Novelty"
            level = "High"
        elif novelty_score >= 50:
            rating = "Moderate Novelty"
            level = "Medium"
        else:
            rating = "Low Novelty (Similar to existing concepts)"
            level = "Low"
            
        return {
            "novelty_score": novelty_score,
            "novelty_rating": rating,
            "novelty_level": level
        }

    @classmethod
    def rank_online_sources(
        cls,
        student_problem_statement: str,
        candidates: List[Dict[str, Any]],
        min_similarity: float = 0.35,
        top_k: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Ranks online candidate sources using MiniLM embeddings comparing:
        STUDENT PROBLEM STATEMENT vs ONLINE CANDIDATE PROBLEM/SOLUTION
        Filters by min_similarity threshold (default 0.35) and returns top_k candidates.
        """
        if not student_problem_statement or not candidates or not cls.is_available():
            return []

        student_emb = cls.get_embedding(f"Problem: {student_problem_statement}")

        ranked_results = []
        for candidate in candidates:
            c_text = f"Title: {candidate.get('title', '')}\nProblem: {candidate.get('problem', '')}\nSolution: {candidate.get('description', '')}"
            try:
                c_emb = cls.get_embedding(c_text)
                sim_score = cls.calculate_cosine_similarity(student_emb, c_emb)
                bounded_sim = max(0.0, round(sim_score, 4))
                
                if bounded_sim >= min_similarity:
                    ranked_results.append({
                        "title": candidate.get("title"),
                        "problem": candidate.get("problem"),
                        "description": candidate.get("description"),
                        "source_type": candidate.get("source_type", "Website"),
                        "source_name": candidate.get("source_name", "Public Source"),
                        "source_url": candidate.get("source_url"),
                        "similarity_score": bounded_sim,
                        "similarity_percentage": round(bounded_sim * 100, 1)
                    })
            except Exception as e:
                logger.warning(f"Error computing candidate embedding for {candidate.get('title')}: {e}")

        ranked_results.sort(key=lambda x: x["similarity_score"], reverse=True)
        return ranked_results[:top_k]

