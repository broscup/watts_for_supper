let recipes = [];
let lastView = 'main'; // Tracks how the user arrived at the recipe

fetch('recipes.json')
    .then(response => response.json())
    .then(data => {
        recipes = data.recipes;
        populateFilters();
        displayRecipes(recipes);
    });

function displayRecipes(displayedRecipes) {
    const recipeList = document.getElementById('recipeList');
    const allRecipesSection = document.getElementById('allRecipesSection');
    allRecipesSection.style.display = 'none';
    recipeList.innerHTML = '';

    displayedRecipes.forEach(recipe => {
        const recipeDiv = document.createElement('div');
        recipeDiv.className = 'recipe';

        let ingredientsList = '<ul>';
        recipe.ingredients.forEach(ingredient => {
            ingredientsList += `<li>${ingredient}</li>`;
        });
        ingredientsList += '</ul>';

        let stepsList = '';
        if (recipe.steps && recipe.steps.length > 0) {
            stepsList = '<ol>';
            recipe.steps.forEach(step => {
                stepsList += `<li>${step}</li>`;
            });
            stepsList += '</ol>';
        } else {
            stepsList = '<p><em>Instructions not available.</em></p>';
        }

        recipeDiv.innerHTML = `
            <h3>${recipe.title}</h3>
            <p><strong>Category:</strong> ${recipe.category}</p>
            <p><strong>Prep Time:</strong> ${recipe.prep_time}</p>
            <p><strong>Difficulty:</strong> ${recipe.difficulty}</p>
            <p><strong>Dietary:</strong> ${recipe.dietary.join(', ')}</p>
            <p><strong>Summary:</strong> ${recipe.summary}</p>
            <button class="expand-button">View Recipe</button>
            <div class="details">
                <button class="back-inside expand-button" style="display:none;">Back</button>
                <p><strong>Ingredients:</strong></p>
                ${ingredientsList}
                <p><strong>Steps:</strong></p>
                ${stepsList}
                <p><strong>Keywords:</strong> ${recipe.keywords.join(', ')}</p>
                <button class="back-inside expand-button" style="display:none;">Back</button>
            </div>
        `;

        recipeList.appendChild(recipeDiv);

        const viewButton = recipeDiv.querySelector('.expand-button');
        viewButton.addEventListener('click', () => {
            showSingleRecipe(recipe);
        });
    });
}

function showSingleRecipe(selectedRecipe) {
    const recipeList = document.getElementById('recipeList');
    const recipeCards = document.querySelectorAll('.recipe');
    recipeCards.forEach(card => {
        const title = card.querySelector('h3').textContent;
        if (title !== selectedRecipe.title) {
            card.style.display = 'none';
        } else {
            card.querySelector('.details').classList.add('show');
            card.querySelector('.expand-button').style.display = 'none';
            card.style.margin = '0 auto';

            card.querySelectorAll('.back-inside').forEach(backBtn => {
                backBtn.style.display = 'inline-block';
                backBtn.textContent = lastView === 'alphabetical' ? 'Back to All Recipes' : (lastView === 'search' ? 'Back to Results' : 'Back to All Recipes');
                backBtn.onclick = () => {
                    if (lastView === 'alphabetical') {
                        generateAlphabeticalList();
                    } else if (lastView === 'search') {
                        filterRecipes();
                    } else {
                        displayRecipes(recipes);
                    }
                };
            });
        }
    });
}

function populateFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    const dietaryFilter = document.getElementById('dietaryFilter');

    const categories = [...new Set(recipes.map(r => r.category))];
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categoryFilter.appendChild(option);
    });

    const dietaryTags = [...new Set(recipes.flatMap(r => r.dietary))];
    dietaryTags.forEach(tag => {
        const option = document.createElement('option');
        option.value = tag;
        option.textContent = tag.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        dietaryFilter.appendChild(option);
    });
}

const searchInput = document.getElementById('searchInput');
const searchToggle = document.getElementById('searchToggle');
const clearSearch = document.getElementById('clearSearch');
const categoryFilter = document.getElementById('categoryFilter');
const dietaryFilter = document.getElementById('dietaryFilter');

searchToggle.addEventListener('click', () => {
    searchInput.style.display = searchInput.style.display === 'block' ? 'none' : 'block';
    if (searchInput.style.display === 'block') {
        searchInput.focus();
    }
});

searchInput.addEventListener('input', () => {
    clearSearch.style.display = searchInput.value ? 'inline' : 'none';
    filterRecipes();
});

clearSearch.addEventListener('click', () => {
    searchInput.value = '';
    clearSearch.style.display = 'none';
    filterRecipes();
});

categoryFilter.addEventListener('change', filterRecipes);
dietaryFilter.addEventListener('change', filterRecipes);

document.getElementById('allRecipesLink').addEventListener('click', () => {
    lastView = 'alphabetical';
    generateAlphabeticalList();
});

document.getElementById('backFromAll').addEventListener('click', () => {
    lastView = 'main';
    document.getElementById('allRecipesSection').style.display = 'none';
    filterRecipes();
});

function filterRecipes() {
    const searchText = searchInput.value.toLowerCase();

    let filtered = recipes.filter(recipe => {
        const searchMatch =
            recipe.title.toLowerCase().includes(searchText) ||
            recipe.category.toLowerCase().includes(searchText) ||
            recipe.prep_time.toLowerCase().includes(searchText) ||
            recipe.difficulty.toLowerCase().includes(searchText) ||
            recipe.summary.toLowerCase().includes(searchText) ||
            recipe.ingredients.join(' ').toLowerCase().includes(searchText) ||
            recipe.dietary.join(' ').toLowerCase().includes(searchText) ||
            recipe.keywords.join(' ').toLowerCase().includes(searchText) ||
            (recipe.steps ? recipe.steps.join(' ').toLowerCase().includes(searchText) : false);

        const categoryMatch = !categoryFilter.value || recipe.category === categoryFilter.value;
        const dietaryMatch = !dietaryFilter.value || recipe.dietary.includes(dietaryFilter.value);

        return searchMatch && categoryMatch && dietaryMatch;
    });

    lastView = searchText || categoryFilter.value || dietaryFilter.value ? 'search' : 'main';

    displayRecipes(filtered);
}

function generateAlphabeticalList() {
    const alphabeticalList = document.getElementById('alphabeticalList');
    const allRecipesSection = document.getElementById('allRecipesSection');
    const recipeList = document.getElementById('recipeList');

    recipeList.innerHTML = '';
    allRecipesSection.style.display = 'block';
    alphabeticalList.innerHTML = '';

    const sorted = [...recipes].sort((a, b) => a.title.localeCompare(b.title));
    const grouped = {};

    sorted.forEach(recipe => {
        const firstLetter = recipe.title[0].toUpperCase();
        if (!grouped[firstLetter]) grouped[firstLetter] = [];
        grouped[firstLetter].push(recipe);
    });

    for (const letter in grouped) {
        const letterHeading = document.createElement('h3');
        letterHeading.textContent = letter;
        alphabeticalList.appendChild(letterHeading);

        const ul = document.createElement('ul');
        grouped[letter].forEach(recipe => {
            const li = document.createElement('li');
            li.textContent = recipe.title;
            li.addEventListener('click', () => {
                allRecipesSection.style.display = 'none';
                displayRecipes([recipe]);
                showSingleRecipe(recipe);
            });
        ul.appendChild(li);
        });
        alphabeticalList.appendChild(ul);
    }
}
