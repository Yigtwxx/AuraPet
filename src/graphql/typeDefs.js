const { gql } = require('apollo-server');

const typeDefs = gql`
    type Pet {
        id: ID!
        name: String!
        species: String!
        age: Int
        mood: String
        lastInteraction: String
    }

    type Query {
        getPets: [Pet]
        getPet(id: ID!): Pet
    }

    type Mutation {
        createPet(name: String!, species: String!, age: Int): Pet
        updatePetMood(id: ID!, mood: String!): Pet
        askPet(id: ID!, question: String!): String
    }
`;

module.exports = typeDefs;
