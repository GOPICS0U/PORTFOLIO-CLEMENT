/* =========================
   🎬 PORTFOLIO INTERACTIF
   Script JavaScript amélioré
   ========================= */

class PortfolioApp {
  constructor() {
    this.init();
    this.setupEventListeners();
    this.setupAnimations();
    this.setupProgressBar();
  }

  init() {
    // Configuration
    this.isLoading = true;
    this.currentFilter = 'all';
    this.projects = [];
    this.observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    // Elements DOM
    this.header = document.querySelector('header');
    this.progressBar = document.getElementById('progressBar');
    this.loadingOverlay = document.getElementById('loadingOverlay');
    this.burger = document.querySelector('.burger');
    this.nav = document.getElementById('primary-nav');
    this.toTopBtn = document.getElementById('toTop');
    this.contactForm = document.getElementById('contactForm');
    this.yearEl = document.getElementById('year');

    // Initialiser l'année
    if (this.yearEl) {
      this.yearEl.textContent = new Date().getFullYear();
    }

    // Simuler le chargement
    this.simulateLoading();
  }

  setupEventListeners() {
    // Navigation
    this.setupNavigation();

    // Burger menu
    this.setupBurgerMenu();

    // Projets et filtres
    this.setupProjectFilters();
    this.setupProjectCards();

    // Formulaire de contact
    this.setupContactForm();

    // Scroll events
    this.setupScrollEvents();

    // Bouton retour en haut
    this.setupBackToTop();

    // Raccourcis clavier
    this.setupKeyboardShortcuts();
  }

  simulateLoading() {
    // Simuler un temps de chargement réaliste
    setTimeout(() => {
      this.isLoading = false;
      if (this.loadingOverlay) {
        this.loadingOverlay.classList.add('hidden');
        setTimeout(() => {
          this.loadingOverlay.style.display = 'none';
        }, 600);
      }

      // Déclencher les animations d'entrée
      this.triggerEntryAnimations();
    }, 1500);
  }

  triggerEntryAnimations() {
    // Animation échelonnée des éléments
    const heroElements = document.querySelectorAll('.hero [data-animate]');
    heroElements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('visible');
      }, index * 200);
    });
  }

  setupNavigation() {
    const navLinks = document.querySelectorAll('.navlink');
    const sections = Array.from(navLinks).map(link => {
      const href = link.getAttribute('href');
      return document.querySelector(href);
    }).filter(Boolean);

    // Mise à jour de la navigation active en fonction du scroll
    const updateActiveNav = () => {
      if (this.isLoading) return;

      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const threshold = windowHeight / 3;

      let activeIndex = 0;

      sections.forEach((section, index) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= threshold && rect.bottom >= threshold) {
          activeIndex = index;
        }
      });

      navLinks.forEach((link, index) => {
        link.classList.toggle('active', index === activeIndex);
      });
    };

    // Scroll fluide vers les sections
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);

        if (targetSection) {
          const offsetTop = targetSection.offsetTop - 80;
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });

          // Fermer le menu mobile si ouvert
          this.closeMobileMenu();
        }
      });
    });

    // Throttled scroll event pour les performances
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updateActiveNav();
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  setupBurgerMenu() {
    if (!this.burger || !this.nav) return;

    this.burger.addEventListener('click', () => {
      this.toggleMobileMenu();
    });

    // Fermer le menu en cliquant sur un lien
    this.nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        this.closeMobileMenu();
      });
    });

    // Fermer le menu avec Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeMobileMenu();
      }
    });

    // Fermer le menu en cliquant à l'extérieur
    document.addEventListener('click', (e) => {
      if (!this.nav.contains(e.target) && !this.burger.contains(e.target)) {
        this.closeMobileMenu();
      }
    });
  }

  toggleMobileMenu() {
    const isOpen = this.nav.getAttribute('data-state') === 'open';
    const newState = isOpen ? 'closed' : 'open';

    this.nav.setAttribute('data-state', newState);
    this.burger.setAttribute('aria-expanded', String(!isOpen));

    if (!isOpen) {
      // Focus sur le premier élément du menu
      const firstLink = this.nav.querySelector('a');
      if (firstLink) {
        setTimeout(() => firstLink.focus(), 300);
      }
    }
  }

  closeMobileMenu() {
    this.nav.setAttribute('data-state', 'closed');
    this.burger.setAttribute('aria-expanded', 'false');
  }

  setupProjectFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.card');

    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const filter = btn.dataset.filter;
        this.filterProjects(filter, filterButtons, cards);
      });
    });
  }

  filterProjects(filter, filterButtons, cards) {
    // Mettre à jour les boutons actifs
    filterButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });

    // Filtrer et animer les cartes
    cards.forEach((card, index) => {
      const category = card.dataset.category;
      const shouldShow = filter === 'all' || category === filter;

      if (shouldShow) {
        card.style.display = 'block';
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0) scale(1)';
        }, index * 50);
      } else {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px) scale(0.95)';
        setTimeout(() => {
          card.style.display = 'none';
        }, 300);
      }
    });

    this.currentFilter = filter;
  }

  setupProjectCards() {
    const cardsContainer = document.getElementById('cards');
    if (!cardsContainer) return;

    // Créer la modale si elle n'existe pas
    this.createModal();

    cardsContainer.addEventListener('click', (e) => {
      const card = e.target.closest('.card');
      if (!card) return;

      // Vérifier si on clique sur le bouton "Découvrir" ou la carte
      if (e.target.classList.contains('more-btn') ||
        e.target.closest('.card-content') ||
        e.target.classList.contains('play-btn')) {

        const projectData = {
          title: card.dataset.title || 'Projet',
          role: card.dataset.role || '',
          synopsis: card.dataset.synopsis || '',
          link: card.dataset.link || '',
          date: card.dataset.date || '',
          category: card.dataset.category || '',
          image: card.querySelector('img')?.src || ''
        };

        this.openProjectModal(projectData);
      }
    });

    // Gérer le bouton "Voir plus"
    const loadMoreBtn = document.getElementById('loadMore');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', this.loadMoreProjects.bind(this));
    }
  }

  createModal() {
    if (document.querySelector('.modal-backdrop')) return;

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    document.body.appendChild(backdrop);

    // Fermer la modale en cliquant sur le backdrop
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        this.closeModal();
      }
    });

    // Fermer avec Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && backdrop.hasAttribute('open')) {
        this.closeModal();
      }
    });

    this.modalBackdrop = backdrop;
  }

  openProjectModal(projectData) {
    if (!this.modalBackdrop) return;

    const modalHTML = `
      <div class="modal">
        <div class="modal-head">
          <strong>${projectData.title}</strong>
          <button class="close-btn" aria-label="Fermer la modale">×</button>
        </div>
        <div class="modal-body">
          <div>
            <img alt="Visuel du projet ${projectData.title}" src="${projectData.image}" />
            ${projectData.category ? `<div class="category-tag ${projectData.category}" style="margin-top: 1rem;">${this.getCategoryLabel(projectData.category)}</div>` : ''}
          </div>
          <div>
            <p>${projectData.synopsis || 'Aucune description disponible.'}</p>
            
            <div class="meta-tag">
              <strong>Rôle :</strong> ${projectData.role || 'Non spécifié'}
            </div>
            
            ${projectData.date ? `
              <div class="meta-tag">
                <strong>Date :</strong> ${projectData.date}
              </div>
            ` : ''}
            
            <div class="actions" style="margin-top: 1.5rem;">
              ${projectData.link ? `
                <a class="btn primary" href="${projectData.link}" target="_blank" rel="noopener noreferrer">
                  <span>🎬</span> Voir le projet
                </a>
              ` : ''}
              <button class="btn secondary close-modal-btn">Fermer</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.modalBackdrop.innerHTML = modalHTML;

    // Ajouter les event listeners
    this.modalBackdrop.querySelectorAll('.close-btn, .close-modal-btn').forEach(btn => {
      btn.addEventListener('click', () => this.closeModal());
    });

    // Ouvrir la modale avec animation
    this.modalBackdrop.setAttribute('open', '');
    document.body.style.overflow = 'hidden';

    // Focus sur le bouton de fermeture
    const closeBtn = this.modalBackdrop.querySelector('.close-btn');
    if (closeBtn) {
      setTimeout(() => closeBtn.focus(), 100);
    }
  }

  getCategoryLabel(category) {
    const labels = {
      'film': 'Court-métrage',
      'music': 'Musique',
      'experimental': 'Expérimental'
    };
    return labels[category] || category;
  }

  closeModal() {
    if (!this.modalBackdrop) return;

    this.modalBackdrop.removeAttribute('open');
    document.body.style.overflow = '';

    setTimeout(() => {
      this.modalBackdrop.innerHTML = '';
    }, 300);
  }

  loadMoreProjects() {
    // Simuler le chargement de plus de projets
    const loadMoreBtn = document.getElementById('loadMore');
    if (!loadMoreBtn) return;

    loadMoreBtn.innerHTML = '<span>Chargement...</span>';
    loadMoreBtn.disabled = true;

    setTimeout(() => {
      // Ici vous pourriez charger de vrais projets depuis une API
      loadMoreBtn.innerHTML = 'Tous les projets affichés';
      loadMoreBtn.disabled = true;
      loadMoreBtn.classList.add('disabled');
    }, 1500);
  }

  setupContactForm() {
    if (!this.contactForm) return;

    this.contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleFormSubmission(e.target);
    });

    // Validation en temps réel
    const inputs = this.contactForm.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearFieldError(input));
    });
  }

  async handleFormSubmission(form) {
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    const messageEl = document.getElementById('formMessage');

    // Validation côté client
    if (!this.validateForm(form)) {
      this.showFormMessage('Veuillez corriger les erreurs dans le formulaire.', 'error');
      return;
    }

    // État de chargement
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';

    try {
      const formData = new FormData(form);
      const name = formData.get('name')?.trim() || '';

      // Simuler l'envoi (remplacez par votre logique d'envoi réelle)
      await this.simulateFormSubmission(formData);

      // Succès
      form.reset();
      this.showFormMessage(
        `Merci${name ? `, ${name}` : ''} ! Votre message a bien été envoyé. Je vous répondrai dans les plus brefs délais.`,
        'success'
      );

      // Analytics (optionnel)
      this.trackEvent('form_submit', { category: 'contact' });

    } catch (error) {
      console.error('Erreur lors de l\'envoi du formulaire:', error);
      this.showFormMessage(
        'Une erreur est survenue lors de l\'envoi. Veuillez réessayer ou me contacter directement.',
        'error'
      );
    } finally {
      // Restaurer l'état du bouton
      submitBtn.disabled = false;
      btnText.style.display = 'inline';
      btnLoading.style.display = 'none';
    }
  }

  async simulateFormSubmission(formData) {
    // Simuler une requête réseau
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simuler succès dans 90% des cas
        if (Math.random() > 0.1) {
          resolve({ success: true });
        } else {
          reject(new Error('Erreur de simulation'));
        }
      }, 2000);
    });
  }

  validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');

    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });

    return isValid;
  }

  validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    // Effacer les erreurs précédentes
    this.clearFieldError(field);

    // Validation selon le type de champ
    switch (field.type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errorMessage = 'Veuillez saisir une adresse email valide';
          isValid = false;
        }
        break;

      case 'text':
        if (field.name === 'name' && value.length < 2) {
          errorMessage = 'Le nom doit contenir au moins 2 caractères';
          isValid = false;
        }
        break;

      case 'textarea':
        if (field.name === 'message' && value.length < 10) {
          errorMessage = 'Le message doit contenir au moins 10 caractères';
          isValid = false;
        }
        break;

      default:
        if (field.hasAttribute('required') && !value) {
          errorMessage = 'Ce champ est obligatoire';
          isValid = false;
        }
    }

    if (!isValid) {
      this.showFieldError(field, errorMessage);
    }

    return isValid;
  }

  showFieldError(field, message) {
    field.classList.add('error');

    // Créer ou mettre à jour le message d'erreur
    let errorEl = field.parentNode.querySelector('.field-error');
    if (!errorEl) {
      errorEl = document.createElement('div');
      errorEl.className = 'field-error';
      field.parentNode.appendChild(errorEl);
    }
    errorEl.textContent = message;
  }

  clearFieldError(field) {
    field.classList.remove('error');
    const errorEl = field.parentNode.querySelector('.field-error');
    if (errorEl) {
      errorEl.remove();
    }
  }

  showFormMessage(message, type = 'info') {
    const messageEl = document.getElementById('formMessage');
    if (!messageEl) return;

    messageEl.className = `form-message ${type}`;
    messageEl.textContent = message;
    messageEl.style.display = 'block';

    // Auto-hide après 5 secondes pour les messages de succès
    if (type === 'success') {
      setTimeout(() => {
        messageEl.style.display = 'none';
      }, 5000);
    }
  }

  setupScrollEvents() {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.updateProgressBar();
          this.updateHeaderState();
          this.updateBackToTopVisibility();
          this.handleScrollAnimations();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  updateProgressBar() {
    if (!this.progressBar) return;

    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.min((scrollTop / docHeight) * 100, 100);

    this.progressBar.style.width = `${progress}%`;
  }

  updateHeaderState() {
    if (!this.header) return;

    const scrolled = window.scrollY > 50;
    this.header.classList.toggle('scrolled', scrolled);
  }

  updateBackToTopVisibility() {
    if (!this.toTopBtn) return;

    const show = window.scrollY > 500;
    this.toTopBtn.classList.toggle('show', show);
  }

  handleScrollAnimations() {
    if (this.isLoading) return;

    // Observer pour les animations au scroll
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, this.observerOptions);

    // Observer tous les éléments avec data-animate qui ne sont pas encore visibles
    document.querySelectorAll('[data-animate]:not(.visible)').forEach(el => {
      observer.observe(el);
    });
  }

  setupBackToTop() {
    if (!this.toTopBtn) return;

    this.toTopBtn.addEventListener('click', () => {
      // Animation bounce
      this.toTopBtn.classList.add('bounce');

      // Scroll vers le haut
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });

      // Retirer l'animation après completion
      setTimeout(() => {
        this.toTopBtn.classList.remove('bounce');
      }, 600);

      // Analytics (optionnel)
      this.trackEvent('scroll_to_top');
    });
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K pour ouvrir la recherche (futur)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        // Implémentation future pour une fonction de recherche
        console.log('Raccourci recherche détecté');
      }

      // Flèches pour navigation entre projets (en modal)
      if (this.modalBackdrop?.hasAttribute('open')) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
          e.preventDefault();
          this.navigateProjects(e.key === 'ArrowRight' ? 'next' : 'prev');
        }
      }
    });
  }

  navigateProjects(direction) {
    // Navigation entre projets en modal (fonctionnalité future)
    const cards = Array.from(document.querySelectorAll('.card'));
    const visibleCards = cards.filter(card =>
      card.style.display !== 'none' &&
      card.dataset.category === this.currentFilter ||
      this.currentFilter === 'all'
    );

    // Logique de navigation (à implémenter selon les besoins)
    console.log(`Navigation ${direction} entre ${visibleCards.length} projets`);
  }

  // Méthode utilitaire pour les analytics (Google Analytics, etc.)
  trackEvent(eventName, parameters = {}) {
    // Intégration Google Analytics 4
    if (typeof gtag !== 'undefined') {
      gtag('event', eventName, parameters);
    }

    // Intégration alternative (Plausible, etc.)
    if (typeof plausible !== 'undefined') {
      plausible(eventName, { props: parameters });
    }

    // Log pour le développement
    console.log('Track event:', eventName, parameters);
  }

  // Méthode pour gérer les erreurs
  handleError(error, context = 'general') {
    console.error(`Erreur [${context}]:`, error);

    // Reporter les erreurs en production
    if (typeof Sentry !== 'undefined') {
      Sentry.captureException(error, { tags: { context } });
    }

    // Afficher un message d'erreur user-friendly si nécessaire
    if (context === 'form') {
      this.showFormMessage('Une erreur inattendue est survenue. Veuillez réessayer.', 'error');
    }
  }

  // Méthodes utilitaires pour les performances
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  throttle(func, limit) {
    let inThrottle;
    return function () {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }
  }

  // Nettoyage lors de la destruction (si nécessaire)
  destroy() {
    // Nettoyer les event listeners
    window.removeEventListener('scroll', this.handleScroll);
    window.removeEventListener('resize', this.handleResize);

    // Nettoyer les observateurs
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }

    // Nettoyer les timeouts/intervals
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }

    console.log('Portfolio app destroyed');
  }
}

/* =========================
   🚀 INITIALISATION
   ========================= */

// Initialiser l'application quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
  try {
    const app = new PortfolioApp();

    // Exposer l'instance pour le debugging
    if (typeof window !== 'undefined') {
      window.portfolioApp = app;
    }

    console.log('🎬 Portfolio loaded successfully!');
  } catch (error) {
    console.error('Erreur lors de l\'initialisation du portfolio:', error);
  }
});

// Gestion des erreurs JavaScript globales
window.addEventListener('error', (e) => {
  console.error('Erreur JavaScript globale:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Promise rejetée non gérée:', e.reason);
});

/* =========================
   🎨 STYLES DYNAMIQUES CSS
   ========================= */

// Ajouter des styles CSS pour les erreurs de formulaire
const dynamicStyles = `
  .input-group input.error,
  .input-group select.error,
  .input-group textarea.error {
    border-color: var(--error);
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }

  .field-error {
    color: var(--error);
    font-size: 0.8rem;
    margin-top: 0.25rem;
    padding-left: 3rem;
  }

  .input-group input.error + .field-error {
    animation: shake 0.3s ease-in-out;
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-2px); }
    75% { transform: translateX(2px); }
  }

  /* États de chargement améliorés */
  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }

  .btn-loading {
    position: relative;
  }

  .btn-loading::after {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    margin: auto;
    border: 2px solid transparent;
    border-top-color: currentColor;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
`;

// Injecter les styles dynamiques
const styleSheet = document.createElement('style');
styleSheet.textContent = dynamicStyles;
document.head.appendChild(styleSheet);