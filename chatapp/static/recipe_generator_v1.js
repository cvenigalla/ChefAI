console.log("Recipe Generator Script v2.2 - Bug Fix Update (recipe_generator_v2.js)");
console.log("Script started");
console.log("Document readyState:", document.readyState);
console.log("Full HTML:", document.documentElement.outerHTML);

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded");
    const recipePrompt = document.getElementById('recipe-prompt');
    const generateButton = document.getElementById('generate-button');
    const spiceButton = document.getElementById('spice-button');
    const simplifyButton = document.getElementById('simplify-button');
    const fancyButton = document.getElementById('fancy-button');
    const veganButton = document.getElementById('vegan-button');
    const recipeOutput = document.getElementById('recipe-output');

    console.log("Recipe Prompt:", recipePrompt);
    console.log("Generate Button:", generateButton);
    console.log("Spice Button:", spiceButton);
    console.log("Simplify Button:", simplifyButton);
    console.log("Fancy Button:", fancyButton);
    console.log("Vegan Button:", veganButton);
    console.log("Recipe Output:", recipeOutput);

    let currentRecipe = '';

    function addButtonListener(button, action) {
        if (button) {
            button.addEventListener('click', action);
            console.log(`${button.id} listener added`);
        } else {
            console.error(`${button.id} not found`);
        }
    }

    addButtonListener(generateButton, generateRecipe);
    addButtonListener(spiceButton, () => modifyRecipe('spice'));
    addButtonListener(simplifyButton, () => modifyRecipe('simplify'));
    addButtonListener(fancyButton, () => modifyRecipe('fancy'));
    addButtonListener(veganButton, () => modifyRecipe('vegan'));

    if (recipePrompt) {
        recipePrompt.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                generateRecipe();
            }
        });
        console.log("Recipe prompt listener added");
    } else {
        console.error('Recipe prompt input not found');
    }

    function generateRecipe() {
        console.log("Generate recipe function called");
        const prompt = recipePrompt.value.trim();
        if (prompt) {
            recipeOutput.textContent = 'Generating recipe...';
            
            fetch('/api/generate_recipe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt: prompt }),
            })
            .then(response => {
                console.log(`Generate recipe response status: ${response.status}`);
                return response.json();
            })
            .then(data => {
                console.log("Generate recipe response data:", data);
                currentRecipe = data.recipe;
                if (!currentRecipe) {
                    throw new Error("Received empty recipe from server");
                }
                recipeOutput.textContent = currentRecipe;
                console.log("Recipe generated, modification buttons can now be used");
            })
            .catch(error => {
                console.error('Error generating recipe:', error);
                recipeOutput.textContent = 'Sorry, there was an error generating the recipe.';
                currentRecipe = ''; // Reset current recipe on error
            });
        }
    }

    function modifyRecipe(type) {
    console.log(`Modify recipe function called: ${type}`);
    console.log("Current recipe:", currentRecipe);
    if (currentRecipe) {
        recipeOutput.textContent = `Modifying the recipe (${type})...`;
        fetch(`/api/${type}_recipe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ recipe: currentRecipe }),
        })
        .then(response => {
            console.log(`Modify recipe (${type}) response status: ${response.status}`);
            return response.json();
        })
        .then(data => {
            console.log(`Modify recipe (${type}) response data:`, data);
            // Handle all possible variations of the response key
            const possibleKeys = [
                `${type}_recipe`,
                `${type}d_recipe`,
                `${type}y_recipe`,
                `${type.slice(0, -1)}ied_recipe`,
                'recipe'
            ];
            
            currentRecipe = possibleKeys.reduce((acc, key) => acc || data[key], null);

            if (!currentRecipe) {
                console.error(`No matching recipe key found in response. Available keys:`, Object.keys(data));
                throw new Error(`Received empty ${type} recipe from server`);
            }
            recipeOutput.textContent = currentRecipe;
            console.log(`Recipe modified: ${type}`);
        })
        .catch(error => {
            console.error(`Error modifying recipe (${type}):`, error);
            recipeOutput.textContent = `Sorry, there was an error modifying the recipe (${type}).`;
        });
    } else {
        console.log("No recipe to modify");
        recipeOutput.textContent = 'Please generate a recipe first before modifying it.';
    }
}
});