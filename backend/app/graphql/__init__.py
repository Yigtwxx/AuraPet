from __future__ import annotations

import strawberry
from strawberry.fastapi import GraphQLRouter

from app.graphql.mutations import Mutation
from app.graphql.queries import Query

schema = strawberry.Schema(
    query=Query,
    mutation=Mutation,
)

graphql_router: GraphQLRouter = GraphQLRouter(
    schema,
    graphiql=True,
)
