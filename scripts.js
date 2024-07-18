import { books, authors, genres, BOOKS_PER_PAGE } from './data.js';

// Encapsulate book-related functionality
const Book = {
    createElement: (book) => {
        const element = document.createElement('button');
        element.classList.add('preview');
        element.setAttribute('data-preview', book.id);
        element.innerHTML = `
            <img class="preview__image" src="${book.image}" />
            <div class="preview__info">
                <h3 class="preview__title">${book.title}</h3>
                <div class="preview__author">${authors[book.author]}</div>
            </div>
        `;
        return element;
    }
};

// Encapsulate theme management
const Theme = {
    update: (theme) => {
        const isNightMode = theme === 'night';
        document.documentElement.style.setProperty('--color-dark', isNightMode ? '255, 255, 255' : '10, 10, 20');
        document.documentElement.style.setProperty('--color-light', isNightMode ? '10, 10, 20' : '255, 255, 255');
        document.querySelector('[data-settings-theme]').value = theme;
    },
    initialize: () => {
        const prefersDarkScheme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        Theme.update(prefersDarkScheme ? 'night' : 'day');
    }
};

// Encapsulate dropdown functionality
const Dropdown = {
    populate: (selector, data, defaultOption) => {
        const fragment = document.createDocumentFragment();
        const firstOption = document.createElement('option');
        firstOption.value = 'any';
        firstOption.innerText = defaultOption;
        fragment.appendChild(firstOption);

        Object.entries(data).forEach(([id, name]) => {
            const option = document.createElement('option');
            option.value = id;
            option.innerText = name;
            fragment.appendChild(option);
        });

        document.querySelector(selector).appendChild(fragment);
    }
};

// Encapsulate book list management
const BookList = {
    page: 1,
    matches: books,
    
    render: (booksToRender) => {
        const fragment = document.createDocumentFragment();
        booksToRender.forEach(book => {
            fragment.appendChild(Book.createElement(book));
        });
        document.querySelector('[data-list-items]').appendChild(fragment);
    },

    filter: (filters) => {
        BookList.matches = books.filter(book => {
            const genreMatch = filters.genre === 'any' || book.genres.includes(filters.genre);
            const titleMatch = filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase());
            const authorMatch = filters.author === 'any' || book.author === filters.author;
            return titleMatch && authorMatch && genreMatch;
        });
        BookList.page = 1;
    },

    updateShowMoreButton: () => {
        const remainingBooks = BookList.matches.length - (BookList.page * BOOKS_PER_PAGE);
        const showMoreButton = document.querySelector('[data-list-button]');
        showMoreButton.disabled = remainingBooks <= 0;
        showMoreButton.innerHTML = `
            <span>Show more</span>
            <span class="list__remaining"> (${Math.max(remainingBooks, 0)})</span>
        `;
    }
};

// Initialize application
Theme.initialize();
Dropdown.populate('[data-search-genres]', genres, 'All Genres');
Dropdown.populate('[data-search-authors]', authors, 'All Authors');
BookList.render(BookList.matches.slice(0, BOOKS_PER_PAGE));
BookList.updateShowMoreButton();

// Event listeners
document.querySelector('[data-search-cancel]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = false;
});

document.querySelector('[data-settings-cancel]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = false;
});

document.querySelector('[data-header-search]').addEventListener('click', () => {
    document.querySelector('[data-search-overlay]').open = true;
    document.querySelector('[data-search-title]').focus();
});

document.querySelector('[data-header-settings]').addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]').open = true;
});

document.querySelector('[data-list-close]').addEventListener('click', () => {
    document.querySelector('[data-list-active]').open = false;
});

document.querySelector('[data-settings-form]').addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const { theme } = Object.fromEntries(formData);
    Theme.update(theme);
    document.querySelector('[data-settings-overlay]').open = false;
});

document.querySelector('[data-search-form]').addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const filters = Object.fromEntries(formData);
    BookList.filter(filters);

    const noMatches = BookList.matches.length === 0;
    document.querySelector('[data-list-message]').classList.toggle('list__message_show', noMatches);
    document.querySelector('[data-list-items]').innerHTML = '';
    BookList.render(BookList.matches.slice(0, BOOKS_PER_PAGE));
    BookList.updateShowMoreButton();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.querySelector('[data-search-overlay]').open = false;
});

document.querySelector('[data-list-button]').addEventListener('click', () => {
    const nextPageBooks = BookList.matches.slice(BookList.page * BOOKS_PER_PAGE, (BookList.page + 1) * BOOKS_PER_PAGE);
    BookList.render(nextPageBooks);
    BookList.page += 1;
    BookList.updateShowMoreButton();
});

document.querySelector('[data-list-items]').addEventListener('click', (event) => {
    const button = event.target.closest('[data-preview]');
    if (button) {
        const bookId = button.dataset.preview;
        const book = books.find(book => book.id === bookId);

        if (book) {
            document.querySelector('[data-list-active]').open = true;
            document.querySelector('[data-list-blur]').src = book.image;
            document.querySelector('[data-list-image]').src = book.image;
            document.querySelector('[data-list-title]').innerText = book.title;
            document.querySelector('[data-list-subtitle]').innerText = `${authors[book.author]} (${new Date(book.published).getFullYear()})`;
            document.querySelector('[data-list-description]').innerText = book.description;
        }
    }
});
