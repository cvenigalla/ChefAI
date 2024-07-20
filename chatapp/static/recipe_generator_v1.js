console.log("Recipe Generator Script v2.2 - Bug Fix Update (recipe_generator_v2.js)");
console.log("Script started");
console.log("Document readyState:", document.readyState);
console.log("Full HTML:", document.documentElement.outerHTML);

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Content Loaded");
    const recipePrompt = document.getElementById('recipe-prompt');
    const generateButton = document.getElementById('generate-button');
    const spiceButton = document.getElementById('spice-button');
    const spiceSlider = document.getElementById('slider');
    const spiceOutput = document.getElementById('slider-value');
    spiceOutput.textContent = slider.value;
    const fancyButton = document.getElementById('fancy-button');
    const veganButton = document.getElementById('vegan-button');
    const recipeOutput = document.getElementById('recipe-output');
    // const sindarinToggle = document.getElementById('sindarinToggle');
    console.log("Recipe Prompt:", recipePrompt);
    console.log("Generate Button:", generateButton);
    console.log("Spice Button:", spiceButton);
    console.log("Fancy Button:", fancyButton);
    console.log("Vegan Button:", veganButton);
    console.log("Recipe Output:", recipeOutput);

    let currentRecipe = '';
    let sindarinState = false;
    // sindarinToggle.addEventListener('click', ()=>{
    //     sindarinState = !sindarinState;
    //     sindarinToggle.classList.toggle('active')
    // })
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
    addButtonListener(fancyButton, () => modifyRecipe('fancy'));
    addButtonListener(veganButton, () => modifyRecipe('vegan'));

    spiceSlider.addEventListener('input', function() {
        spiceOutput.textContent = this.value; // Update the output text with slider value
    });

    document.getElementById('videoUploadForm').addEventListener('submit', function(e) {
      e.preventDefault();
      var formData = new FormData();
      var videoFile = document.getElementById('videoFile').files[0];
    //   console.log(document.getElementById('loading-spinner'));
      document.getElementById('recipe-output').innerHTML = 'Analizing kitchen...';
      formData.append('video', videoFile);
      fetch('/api/analyze_kitchen', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        if (data.ingredients) {
            document.getElementById('recipe-prompt').value = data.ingredients;
            document.getElementById('recipe-output').classList.remove('loading')
            generateRecipe();
        } else if (data.error) {
          document.getElementById('ingredientsList').innerHTML = '<p>Error: ' + data.error + '</p>';
          document.getElementById('recipe-output').classList.remove('loading')

        }
      })
      .catch(error => {
        console.error('Error:', error);
        document.getElementById('ingredientsList').innerHTML = '<p>An error occurred while processing the video.</p>';
        document.getElementById('recipe-output').classList.remove('loading')
    });
    loadingKitchen=false;
    });

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

    function getComplexityLevel() {
        return parseInt(document.getElementById('slider').value);
    }

    function generateRecipe() {
        console.log("Generate recipe function called");
        const prompt = recipePrompt.value.trim();
        const complexityLevel = getComplexityLevel();
        if (prompt) {
            recipeOutput.textContent = 'Generating recipe...';

            fetch('/api/generate_recipe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    prompt: prompt,
                    complexity: complexityLevel
                }),
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
                recipeOutput.innerHTML = marked.parse(currentRecipe);
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
                recipeOutput.innerHTML = marked.parse(currentRecipe);
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