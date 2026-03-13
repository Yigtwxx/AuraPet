const { HfInference } = require('@huggingface/inference');
require('dotenv').config();

const hf = new HfInference(process.env.HF_API_TOKEN);

const getPetResponse = async (input) => {
    try {
        // Example: Using a text generation model (GPT-2 or similar)
        // You can change the model ID as needed.
        const response = await hf.textGeneration({
            model: 'gpt2',
            inputs: input,
            parameters: {
                max_new_tokens: 50,
                return_full_text: false,
            },
        });
        return response.generated_text;
    } catch (error) {
        console.error('Hugging Face inference error:', error.message);
        return "I'm sorry, I'm a bit confused right now.";
    }
};

module.exports = { getPetResponse };
