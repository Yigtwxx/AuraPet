const Pet = require('../models/Pet');
const { getPetResponse } = require('../services/huggingface');

const resolvers = {
    Query: {
        getPets: async () => await Pet.find(),
        getPet: async (_, { id }) => await Pet.findById(id),
    },
    Mutation: {
        createPet: async (_, { name, species, age }) => {
            const newPet = new Pet({ name, species, age });
            return await newPet.save();
        },
        updatePetMood: async (_, { id, mood }) => {
            return await Pet.findByIdAndUpdate(
                id,
                { mood, lastInteraction: new Date() },
                { new: true }
            );
        },
        askPet: async (_, { id, question }) => {
            const pet = await Pet.findById(id);
            if (!pet) return "Pet not found!";

            const prompt = `As a ${pet.species} named ${pet.name} who is feeling ${pet.mood}, how would you answer the question: "${question}"? Response:`;
            const aiResponse = await getPetResponse(prompt);

            // Update last interaction
            await Pet.findByIdAndUpdate(id, { lastInteraction: new Date() });

            return aiResponse;
        },
    },
};

module.exports = resolvers;
