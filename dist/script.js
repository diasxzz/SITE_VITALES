const header = document.querySelector('.site-header');
const menuButton = document.querySelector('#menuToggle');
const mobileMenu = document.querySelector('#mobileMenu');
const mobileMenuLinks = mobileMenu ? [...mobileMenu.querySelectorAll('a')] : [];

function updateHeader() {
  if (header) header.classList.toggle('is-scrolled', window.scrollY > 8);
}

function setMenu(open, returnFocus = false) {
  if (!menuButton || !mobileMenu) return;
  menuButton.setAttribute('aria-expanded', String(open));
  mobileMenu.hidden = !open;
  document.body.classList.toggle('menu-open', open);
  if (!open && returnFocus) menuButton.focus();
}

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

if (menuButton && mobileMenu) {
  menuButton.addEventListener('click', () => {
    setMenu(menuButton.getAttribute('aria-expanded') !== 'true');
  });
  mobileMenuLinks.forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      setMenu(false, true);
    }
  });
  window.matchMedia('(min-width: 76.01rem)').addEventListener('change', (event) => {
    if (event.matches) setMenu(false);
  });
}

const filterButtons = [...document.querySelectorAll('[data-filter]')];
const productCards = [...document.querySelectorAll('.product-card')];
const filterStatus = document.querySelector('#filterStatus');

function filterProducts(category) {
  let visible = 0;
  productCards.forEach((card) => {
    const show = category === 'all' || card.dataset.category === category;
    card.hidden = !show;
    if (show) visible += 1;
  });
  filterButtons.forEach((button) => {
    const active = button.dataset.filter === category;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  if (filterStatus) {
    filterStatus.textContent = `${visible} ${visible === 1 ? 'referência exibida' : 'referências exibidas'}`;
  }
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => filterProducts(button.dataset.filter || 'all'));
});

document.querySelectorAll('.product-card').forEach((card) => {
  const visual = card.querySelector('.product-visual');
  const toggle = card.querySelector('.view-toggle');
  const toggleLabel = card.querySelector('[data-toggle-label]');
  const visualLabel = card.querySelector('[data-visual-label]');
  if (!visual || !toggle || !toggleLabel || !visualLabel) return;

  const solar = card.dataset.category === 'solar';
  toggle.addEventListener('click', () => {
    const worn = toggle.getAttribute('aria-pressed') !== 'true';
    toggle.setAttribute('aria-pressed', String(worn));
    visual.classList.toggle('is-worn', worn);
    toggleLabel.textContent = worn ? (solar ? 'Ver detalhe' : 'Ver armação') : (solar ? 'Ver inspiração' : 'Ver no rosto');
    visualLabel.textContent = worn ? (solar ? 'INSPIRAÇÃO' : 'NO ROSTO') : (solar ? 'DETALHE' : 'ARMAÇÃO');
  });
});

const citySelect = document.querySelector('#contactCity');
const interestSelect = document.querySelector('#contactInterest');
const messageBox = document.querySelector('#contactMessage');
const selectedFrameStatus = document.querySelector('#selectedFrame');
const copyStatus = document.querySelector('#copyStatus');
const preferenceStatus = document.querySelector('#preferenceStatus');
const preferenceForm = document.querySelector('#preferenceForm');
let selectedFrame = null;
let preferences = null;

function preferenceText() {
  if (!preferences) return '';
  const flex = preferences.flex ? ' e quero consultar dobradiça flexível' : '';
  return ` Para a curadoria: rosto ${preferences.face.toLocaleLowerCase('pt-BR')}, aro ${preferences.size.toLocaleLowerCase('pt-BR')}, preferência ${preferences.material.toLocaleLowerCase('pt-BR')}${flex}.`;
}

function composeMessage() {
  if (!citySelect || !interestSelect || !messageBox) return;
  const city = citySelect.value ? ` Tenho interesse na unidade de ${citySelect.value}.` : '';
  const frame = selectedFrame ? ` Minha referência de estilo é “${selectedFrame.name}”.` : '';
  messageBox.value = `Olá, Vitales!${city} Gostaria de ${interestSelect.value}.${frame}${preferenceText()} Podem me orientar?`;
  if (copyStatus) copyStatus.textContent = '';
}

if (citySelect) citySelect.addEventListener('change', composeMessage);
if (interestSelect) interestSelect.addEventListener('change', composeMessage);
if (messageBox) messageBox.addEventListener('input', () => {
  if (copyStatus) copyStatus.textContent = '';
});

document.querySelectorAll('[data-select-frame]').forEach((link) => {
  link.addEventListener('click', () => {
    const card = link.closest('.product-card');
    if (!card) return;
    selectedFrame = {
      id: card.dataset.frameId || '',
      name: card.dataset.frameName || 'referência selecionada'
    };
    if (selectedFrameStatus) {
      selectedFrameStatus.textContent = `Referência selecionada: ${selectedFrame.name}. A equipe confirmará opções semelhantes e disponibilidade.`;
    }
    if (interestSelect) {
      interestSelect.value = card.dataset.category === 'solar'
        ? 'consultar opções de óculos solares'
        : 'escolher uma armação de grau';
    }
    composeMessage();
  });
});

if (preferenceForm) {
  preferenceForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(preferenceForm);
    preferences = {
      face: String(data.get('face') || 'Não sei'),
      size: String(data.get('size') || 'Não sei'),
      material: String(data.get('material') || 'Sem preferência'),
      flex: data.has('flex')
    };
    composeMessage();
    if (preferenceStatus) {
      preferenceStatus.textContent = 'Preferências adicionadas à sua mensagem. Escolha uma unidade e revise o texto antes de copiar.';
    }
  });
}

document.querySelectorAll('[data-city]').forEach((link) => {
  link.addEventListener('click', () => {
    if (!citySelect) return;
    citySelect.value = link.dataset.city || '';
    composeMessage();
  });
});

const copyButton = document.querySelector('#copyMessage');
if (copyButton && messageBox && copyStatus) {
  copyButton.addEventListener('click', async () => {
    const value = messageBox.value.trim();
    if (!value) {
      copyStatus.textContent = 'Escreva uma mensagem antes de copiar.';
      messageBox.focus();
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      copyStatus.textContent = 'Mensagem copiada. Agora abra o Instagram oficial e cole na conversa.';
    } catch {
      messageBox.focus();
      messageBox.select();
      copyStatus.textContent = 'Selecione e copie o texto. Depois, cole na conversa com a Vitales.';
    }
  });
}

const dock = document.querySelector('.consultant-dock');
function reserveDockSpace() {
  if (!dock) return;
  const fixed = window.getComputedStyle(dock).position === 'fixed';
  const narrow = window.matchMedia('(max-width: 42rem)').matches;
  const space = fixed && narrow ? Math.ceil(dock.getBoundingClientRect().height) : 0;
  document.documentElement.style.setProperty('--dock-space', `${space}px`);
}

if (dock) {
  if ('ResizeObserver' in window) new ResizeObserver(reserveDockSpace).observe(dock);
  window.addEventListener('resize', reserveDockSpace, { passive: true });
  reserveDockSpace();
}
