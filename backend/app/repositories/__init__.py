"""Repository layer.

Repositories isolate all data-access code from business logic. Services depend on
repositories (never on SQLAlchemy directly), which keeps services unit-testable with
in-memory/stubbed repositories and lets the persistence strategy change without
touching business rules.
"""
