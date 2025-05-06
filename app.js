// Watts for Supper — app.js (final version with category mapping, green buttons, two back buttons, and Summary heading)

let recipes = [];
let lastView = 'main';

// --- CATEGORY MAPPING ---
const categoryMap = {
    'breakfast': 'breakfast',
    'snack': 'appetizers/snacks',
    'appetizer': 'appetizers/snacks',
    'appetizers': 'appetizers/snacks',
    'salad': 'soups & salads',
    'soups': 'soups & salads',
    'soup': 'soups & salads',
    'dinner': 'main dishes',
    'lunch': 'main dishes',
    'main': 'main dishes',
    'side': 'side dishes',
    'sides': 'side dishes',
    'drink': 'drinks',
    'drinks': 'drinks',
    'dessert': 'desserts'
};

fetch('recipes.json')
    .then(response => response.json())
    .then(data => {
        recipes = data.recipes;
        populateFilters();
        displayRecipes(recipes);
    });

function hideAllSections() {
    document.getElementById('allRecipesSection').style.display = 'none';
    document.getElementById('categoriesSection').style.display = 'none';
    document.getElementById('aboutSection').style.display = 'none';
    document.getElementById('recipeList').innerHTML = '';
}

function displayRecipes(recipesToShow) {
    hideAllSections();
    const recipeList = document.getElementById('recipeList');

    if (recipesToShow.length === 0) {
        recipeList.innerHTML = '<p>No recipes found.</p>';
        return;
    }

    recipesToShow.forEach(recipe => {
        const card = document.createElement('div');
        card.className = 'recipe-card';

        card.innerHTML = `
            <h3>${recipe.title}</h3>
            <p><strong>Category:</strong> ${recipe.category}</p>
            <p><strong>Prep Time:</strong> ${capitalize(recipe.prep_time)}</p>
            <p><strong>Difficulty:</strong> ${capitalize(recipe.difficulty)}</p>
            <p><strong>Dietary:</strong> ${recipe.dietary.map(capitalize).join(', ')}</p>
            <p><strong>Summary:</strong> ${recipe.summary}</p>
            <button class="expand-button">View Recipe</button>
        `;

        const viewBtn = card.querySelector('.expand-button');
        viewBtn.addEventListener('click', () => {
            recipeList.innerHTML = '';
            showSingleRecipe(recipe);
        });

        recipeList.appendChild(card);
    });
}

function capitalize(str) {
    return str ? str.replace(/\b\w/g, c => c.toUpperCase()) : '';
}

function showSingleRecipe(recipe) {
    hideAllSections();
    const recipeList = document.getElementById('recipeList');

    const backText = lastView === 'alphabetical' ? 'All Recipes' :
                     lastView === 'category' ? 'By Category' : 'All Recipes';

    const card = document.createElement('div');
    card.className = 'recipe-card expanded';

    card.innerHTML = `
        <h3>${recipe.title}</h3>
        <p><strong>Category:</strong> ${recipe.category}</p>
        <p><strong>Prep Time:</strong> ${capitalize(recipe.prep_time)}</p>
        <p><strong>Difficulty:</strong> ${capitalize(recipe.difficulty)}</p>
        <p><strong>Dietary:</strong> ${recipe.dietary.map(capitalize).join(', ')}</p>
        <p><strong>Summary:</strong> ${recipe.summary}</p>
        <button class="back-button">Back to ${backText}</button>
        <h4>Ingredients:</h4>
        <ul>${recipe.ingredients.map(item => `<li>${item}</li>`).join('')}</ul>
        <h4>Steps:</h4>
        <ol>${(recipe.steps || []).map(step => `<li>${step}</li>`).join('')}</ol>
        <p><strong>Keywords:</strong> ${recipe.keywords.join(', ')}</p>
        <button class="back-button">Back to ${backText}</button>
    `;

    const backButtons = card.querySelectorAll('.back-button');
    backButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            if (lastView === 'alphabetical') {
                generateAlphabeticalList();
            } else if (lastView === 'category') {
                generateCategoryList();
            } else {
                filterRecipes();
            }
        });
    });

    recipeList.appendChild(card);
}

function populateFilters() {
    const categories = [...new Set(recipes.map(r => categoryMap[r.category.toLowerCase()] || r.category))].sort();
    const dietaryTags = [...new Set(recipes.flatMap(r => r.dietary))].sort();

    categoryFilter.innerHTML = '<option value="">All Categories</option>' +
        categories.map(c => `<option value="${c}">${capitalize(c)}</option>`).join('');

    dietaryFilter.innerHTML = '<option value="">All Dietary Tags</option>' +
        dietaryTags.map(d => `<option value="${d}">${capitalize(d)}</option>`).join('');
}

// --- Search and Filter ---

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

document.getElementById('categoriesLink').addEventListener('click', () => {
    lastView = 'category';
    generateCategoryList();
});

document.getElementById('aboutLink').addEventListener('click', () => {
    hideAllSections();
    document.getElementById('aboutSection').style.display = 'block';
});

document.getElementById('homeLink').addEventListener('click', () => {
    lastView = 'main';
    filterRecipes();
});

document.getElementById('backFromAll').addEventListener('click', () => {
    lastView = 'main';
    filterRecipes();
});

document.getElementById('backFromCategories').addEventListener('click', () => {
    lastView = 'main';
    filterRecipes();
});

document.getElementById('backFromAbout').addEventListener('click', () => {
    lastView = 'main';
    filterRecipes();
});

function filterRecipes() {
    const searchText = searchInput.value.toLowerCase();

    const filtered = recipes.filter(recipe => {
        const searchMatch = recipe.title.toLowerCase().includes(searchText) ||
            recipe.category.toLowerCase().includes(searchText) ||
            recipe.prep_time.toLowerCase().includes(searchText) ||
            recipe.difficulty.toLowerCase().includes(searchText) ||
            recipe.summary.toLowerCase().includes(searchText) ||
            recipe.ingredients.join(' ').toLowerCase().includes(searchText) ||
            recipe.dietary.join(' ').toLowerCase().includes(searchText) ||
            recipe.keywords.join(' ').toLowerCase().includes(searchText) ||
            (recipe.steps ? recipe.steps.join(' ').toLowerCase().includes(searchText) : false);

        const categoryMatch = !categoryFilter.value || (categoryMap[recipe.category.toLowerCase()] || recipe.category) === categoryFilter.value;
        const dietaryMatch = !dietaryFilter.value || recipe.dietary.includes(dietaryFilter.value);

        return searchMatch && categoryMatch && dietaryMatch;
    });

    lastView = searchText || categoryFilter.value || dietaryFilter.value ? 'search' : 'main';
    displayRecipes(filtered);
}

function generateAlphabeticalList() {
    hideAllSections();
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
        const heading = document.createElement('h3');
        heading.textContent = letter;
        alphabeticalList.appendChild(heading);

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

function generateCategoryList() {
    hideAllSections();
    const categoryList = document.getElementById('categoryList');
    const categoriesSection = document.getElementById('categoriesSection');
    const recipeList = document.getElementById('recipeList');

    recipeList.innerHTML = '';
    categoriesSection.style.display = 'block';
    categoryList.innerHTML = '';

    const categoryOrder = [
        'breakfast',
        'appetizers/snacks',
        'soups & salads',
        'main dishes',
        'side dishes',
        'drinks',
        'desserts'
    ];

    const lowerCategoryOrder = categoryOrder.map(c => c.toLowerCase());

    const uniqueCategories = [...new Set(recipes.map(r => categoryMap[r.category.toLowerCase()] || r.category))];

    const sortedCategories = uniqueCategories.sort((a, b) => {
        const indexA = lowerCategoryOrder.indexOf(a.toLowerCase());
        const indexB = lowerCategoryOrder.indexOf(b.toLowerCase());
        if (indexA === -1 && indexB === -1) return a.localeCompare(b);
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
    });

    sortedCategories.forEach(category => {
        const matching = recipes.filter(r => {
            const mapped = categoryMap[r.category.toLowerCase()] || r.category;
            return mapped.toLowerCase() === category.toLowerCase();
        });

        if (matching.length > 0) {
            const h3 = document.createElement('h3');
            h3.textContent = capitalize(category);
            categoryList.appendChild(h3);

            const ul = document.createElement('ul');
            matching.forEach(recipe => {
                const li = document.createElement('li');
                li.textContent = recipe.title;
                li.addEventListener('click', () => {
                    categoriesSection.style.display = 'none';
                    displayRecipes([recipe]);
                    showSingleRecipe(recipe);
                });
                ul.appendChild(li);
            });

            categoryList.appendChild(ul);
        }
    });
}
