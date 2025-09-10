import Cypress from 'cypress';

const API_BASE = 'https://norma.nomoreparties.space/api';
const SELECTOR_BUN_PRIMARY = `[data-cy=${'643d69a5c3f7b9001cfa093c'}]`;
const SELECTOR_BUN_SECONDARY = `[data-cy=${'643d69a5c3f7b9001cfa093d'}]`;
const SELECTOR_FILLING_SAMPLE = `[data-cy=${'643d69a5c3f7b9001cfa0941'}]`;

const addBun = (selector: string) => {
  cy.get(selector).children('button').click();
};

const addFilling = (selector: string) => {
  cy.get(selector).children('button').click();
};

const openIngredientModal = (selector: string) => {
  cy.get(selector).children('a').click();
};

beforeEach(() => {
  cy.intercept('GET', `${API_BASE}/ingredients`, { fixture: 'ingredients.json' });
  cy.intercept('POST', `${API_BASE}/auth/login`, { fixture: 'user.json' });
  cy.intercept('GET', `${API_BASE}/auth/user`, { fixture: 'user.json' });
  cy.intercept('POST', `${API_BASE}/orders`, { fixture: 'orderResponse.json' });

  cy.visit('/');
  cy.viewport(1440, 800);

  cy.get('#modals').as('modal');
});

describe('Конструктор бургера: выбор и подсчёт ингредиентов', () => {
  it('счётчик ингредиента увеличивается при добавлении', () => {
    addFilling(SELECTOR_FILLING_SAMPLE);
    cy.get(SELECTOR_FILLING_SAMPLE).find('.counter__num').contains('1');
  });

  describe('Добавление булок и начинок', () => {
    it('в сборку попадают булка и начинка (булка добавлена первой)', () => {
      addBun(SELECTOR_BUN_PRIMARY);
      addFilling(SELECTOR_FILLING_SAMPLE);
    });

    it('в сборку попадают булка и начинка (начинка добавлена первой)', () => {
      addFilling(SELECTOR_FILLING_SAMPLE);
      addBun(SELECTOR_BUN_PRIMARY);
    });
  });

  describe('Замена булки при повторном выборе', () => {
    it('замена булки при пустом списке начинок', () => {
      addBun(SELECTOR_BUN_PRIMARY);
      addBun(SELECTOR_BUN_SECONDARY);
    });

    it('замена булки, когда уже есть начинка', () => {
      addBun(SELECTOR_BUN_PRIMARY);
      addFilling(SELECTOR_FILLING_SAMPLE);
      addBun(SELECTOR_BUN_SECONDARY);
    });
  });
});

describe('Оформление заказа: авторизация и успешный ответ', () => {
  beforeEach(() => {
    window.localStorage.setItem('refreshToken', 'ipsum');
    cy.setCookie('accessToken', 'lorem');
    cy.getAllLocalStorage().should('not.be.empty');
    cy.getCookie('accessToken').should('exist');
  });

  afterEach(() => {
    window.localStorage.clear();
    cy.clearAllCookies();

    cy.getAllLocalStorage().should('be.empty');
    cy.getAllCookies().should('be.empty');
  });

  it('отправка заказа и проверка номера в модальном окне', () => {
    addBun(SELECTOR_BUN_PRIMARY);
    addFilling(SELECTOR_FILLING_SAMPLE);

    cy.get(`[data-cy='order-button']`).click();

    // В ответе фикстуры orderResponse.json номер заказа = 38483
    cy.get('@modal').find('h2').contains('38483');
  });
});

describe('Модальные окна ингредиента: открытие и способы закрытия', () => {
  it('открытие модального окна с деталями ингредиента и проверка URL', () => {
    cy.get('@modal').should('be.empty');
    openIngredientModal(SELECTOR_FILLING_SAMPLE);

    cy.get('@modal').should('not.be.empty');
    cy.url().should('include', '643d69a5c3f7b9001cfa0941');
  });

  it('закрытие модального окна по кнопке «✕»', () => {
    cy.get('@modal').should('be.empty');
    openIngredientModal(SELECTOR_FILLING_SAMPLE);

    cy.get('@modal').should('not.be.empty');
    cy.get('@modal').find('button').click();

    cy.get('@modal').should('be.empty');
  });

  it('закрытие модального окна по клику на оверлей', () => {
    cy.get('@modal').should('be.empty');
    openIngredientModal(SELECTOR_FILLING_SAMPLE);

    cy.get('@modal').should('not.be.empty');
    cy.get(`[data-cy='overlay']`).click({ force: true });

    cy.get('@modal').should('be.empty');
  });

  it('закрытие модального окна по клавише Escape', () => {
    cy.get('@modal').should('be.empty');
    openIngredientModal(SELECTOR_FILLING_SAMPLE);

    cy.get('@modal').should('not.be.empty');
    cy.get('body').trigger('keydown', { key: 'Escape' });

    cy.get('@modal').should('be.empty');
  });
});
