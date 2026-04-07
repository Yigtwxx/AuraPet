from __future__ import annotations

import strawberry
from strawberry.fastapi import GraphQLRouter

from app.graphql.mutations import Mutation
from app.graphql.queries import Query

schema = strawberry.Schema(
    query=Query,
    mutation=Mutation,
    description=(
        "AuraPet GraphQL API — "
        "Türkçe duygu analizi ile evrilen dijital evcil hayvan ekosistemi."
    ),
)

graphql_router = GraphQLRouter(
    schema,
    graphiql=True,   # /graphql adresinde interaktif GraphiQL playground
)
