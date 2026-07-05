const GOOGLE_SCRIPT_URL = ''; // Collez votre URL Google Apps Script Web App ici pour stocker sur Google Sheets

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Language Toggle Logic ---
    const body = document.body;
    const langBtn = document.getElementById('langBtn');

    // Default language is French
    let currentLang = 'fr';

    const updateLanguageAttributes = (lang) => {
        document.querySelectorAll('[data-fr][data-en]').forEach(el => {
            const txt = el.getAttribute(`data-${lang}`);
            if (txt) el.innerText = txt;
        });
        document.querySelectorAll('input[data-placeholder-fr][data-placeholder-en], select[data-placeholder-fr][data-placeholder-en]').forEach(input => {
            const ph = input.getAttribute(`data-placeholder-${lang}`);
            if (ph) input.setAttribute('placeholder', ph);
        });
    };

    langBtn.addEventListener('click', () => {
        currentLang = currentLang === 'fr' ? 'en' : 'fr';
        body.setAttribute('data-lang', currentLang);
        localStorage.setItem('pref-lang', currentLang);
        updateLanguageAttributes(currentLang);
    });

    // Load preferred language if available
    const savedLang = localStorage.getItem('pref-lang');
    if (savedLang) {
        currentLang = savedLang;
        body.setAttribute('data-lang', currentLang);
    }
    updateLanguageAttributes(currentLang);

    // --- 2. Mobile Menu Toggle ---
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('open');
        mobileMenu.classList.toggle('open');
    });

    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('open');
            mobileMenu.classList.remove('open');
        });
    });

    // --- 3. Scroll Effects & Active Nav Links ---
    const header = document.getElementById('main-header');
    const navLinks = document.querySelectorAll('.nav-links a:not(.btn-nav-register)');
    const sections = document.querySelectorAll('section');

    window.addEventListener('scroll', () => {
        // Sticky Header scroll styling (trigger shadow only when header becomes sticky at the top)
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Active Link highlighting
        let currentSectionId = '';
        sections.forEach(sec => {
            const secTop = sec.offsetTop - 120;
            const secHeight = sec.offsetHeight;
            if (window.scrollY >= secTop && window.scrollY < secTop + secHeight) {
                currentSectionId = sec.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });

    // --- 4. Intersection Observer for Scroll Animations ---
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -60px 0px',
        threshold: 0.08
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                // Remove animation classes after transition ends so CSS hover works normally
                setTimeout(() => {
                    entry.target.classList.remove('animate-ready', 'animate-in');
                }, 900);
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animTargets = document.querySelectorAll(
        '.theme-card, .theme-card-official, .keynote-card, .member-item, .committee-avatar-card, .pricing-card, ' +
        '.venue-wrapper, .section-title, .about-card, ' +
        '.speaker-card-unified, .footer-brand, .footer-links, .footer-partners, ' +
        '.hero-info-bar, .fee-table-container, #formContainer, ' +
        '.venue-details, .venue-map-container, .receipt-view, ' +
        '.pre-hero-banner, .hero-badge-wrapper, .hero-container h1, .hero-sub, .hero-buttons, ' +
        '.date-col, .about-text, .stat-card'
    );
    animTargets.forEach((target, i) => {
        target.classList.add('animate-ready');
        observer.observe(target);
    });

    // --- 5. Currency Selector for Fees Table ---
    const currencyToggle = document.getElementById('currencyToggle');
    const pricingRows = document.querySelectorAll('#pricingBody tr');
    let currentCurrency = 'MAD'; // Alternates with 'EUR'

    currencyToggle.addEventListener('click', () => {
        currentCurrency = currentCurrency === 'MAD' ? 'EUR' : 'MAD';
        
        // Update currency button bilingually
        const frBtn = currencyToggle.querySelector('.lang-fr');
        const enBtn = currencyToggle.querySelector('.lang-en');
        if (frBtn) frBtn.innerText = `Devise: ${currentCurrency}`;
        if (enBtn) enBtn.innerText = `Currency: ${currentCurrency}`;

        pricingRows.forEach(row => {
            const valBeforeCell = row.querySelector('.val-before');
            const valAfterCell = row.querySelector('.val-after');

            const madBefore = row.getAttribute('data-mad-before');
            const madAfter = row.getAttribute('data-mad-after');
            const eurBefore = row.getAttribute('data-eur-before');
            const eurAfter = row.getAttribute('data-eur-after');

            // Detect if this is an international category using the row class or content
            const isInternational = row.cells[0].textContent.includes('International');

            if (currentCurrency === 'MAD') {
                valBeforeCell.innerText = `${madBefore}.00 MAD`;
                valAfterCell.innerText = `${madAfter}.00 MAD`;
            } else {
                valBeforeCell.innerText = `${eurBefore}.00 EUR`;
                valAfterCell.innerText = `${eurAfter}.00 EUR`;
            }
        });
    });

    // --- 6. Dynamic Form Fields (Conditional inputs based on radio selections) ---
    const partTypeRadios = document.querySelectorAll('input[name="participation_type"]');
    const commFields = document.getElementById('commFields');
    const abstractTitle = document.getElementById('abstractTitle');
    const communicantName = document.getElementById('communicantName');
    const communicantAffiliation = document.getElementById('communicantAffiliation');
    const coAuthors = document.getElementById('coAuthors');
    const abstractFile = document.getElementById('abstractFile');

    const workshopFields = document.getElementById('workshopFields');
    const workshopSelect = document.getElementById('workshopSelect');

    function toggleFormSections() {
        const selectedRadio = document.querySelector('input[name="participation_type"]:checked');
        const selectedVal = selectedRadio ? selectedRadio.value : 'attendance';
        
        const isComm = (selectedVal === 'communication' || selectedVal === 'comm_workshops');
        const isWork = (selectedVal === 'workshops' || selectedVal === 'comm_workshops');
        
        // Communication fields
        if (isComm) {
            commFields.classList.add('show');
            if (abstractTitle) abstractTitle.required = true;
            if (communicantName) communicantName.required = true;
            if (communicantAffiliation) communicantAffiliation.required = true;
            if (coAuthors) coAuthors.required = true;
            if (abstractFile) abstractFile.required = true;
        } else {
            commFields.classList.remove('show');
            if (abstractTitle) { abstractTitle.required = false; abstractTitle.value = ''; }
            if (communicantName) { communicantName.required = false; communicantName.value = ''; }
            if (communicantAffiliation) { communicantAffiliation.required = false; communicantAffiliation.value = ''; }
            if (coAuthors) { coAuthors.required = false; coAuthors.value = ''; }
            if (abstractFile) { abstractFile.required = false; abstractFile.value = ''; }
        }

        // Workshop fields
        if (isWork) {
            workshopFields.classList.add('show');
            if (workshopSelect) workshopSelect.required = true;
        } else {
            workshopFields.classList.remove('show');
            if (workshopSelect) { workshopSelect.required = false; workshopSelect.value = ''; }
        }
    }

    partTypeRadios.forEach(radio => {
        radio.addEventListener('change', toggleFormSections);
    });

    // Initial check
    toggleFormSections();

    // --- 7. Form Submission & Automatic Receipt Generator ---
    const regForm = document.getElementById('regForm');
    const formContainer = document.getElementById('formContainer');
    const receiptView = document.getElementById('receiptView');
    const backToFormBtn = document.getElementById('backToFormBtn');

    // Fee database mapping profile values to prices (Before Oct 1, After Oct 1)
    const feeMatrix = {
        student_maroc: { labelFr: 'Doctorant Marocain', labelEn: 'Moroccan PhD Student', madBefore: 400, madAfter: 600, eurBefore: 40, eurAfter: 60, currency: 'MAD' },
        student_inter: { labelFr: 'Doctorant International', labelEn: 'International PhD Student', madBefore: 800, madAfter: 1000, eurBefore: 80, eurAfter: 100, currency: 'EUR' },
        faculty_maroc: { labelFr: 'Enseignant-Chercheur Marocain', labelEn: 'Moroccan Faculty / Researcher', madBefore: 800, madAfter: 1000, eurBefore: 80, eurAfter: 100, currency: 'MAD' },
        faculty_inter: { labelFr: 'Enseignant-Chercheur International', labelEn: 'International Faculty / Researcher', madBefore: 1000, madAfter: 1200, eurBefore: 100, eurAfter: 120, currency: 'EUR' },
        public_org: { labelFr: 'Participant Secteur Public/Privé', labelEn: 'Public/Private Sector Participant', madBefore: 1000, madAfter: 1200, eurBefore: 100, eurAfter: 120, currency: 'EUR' }
    };

    regForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // 1. Gather values
        const lastName = document.getElementById('lastName').value.trim();
        const firstName = document.getElementById('firstName').value.trim();
        const country = document.getElementById('country').value.trim();
        const city = document.getElementById('city').value.trim();
        const phone = document.getElementById('phone').value.trim();

        // Validate phone number: must start with '+' followed by country code and digits
        const cleanPhone = phone.replace(/[\s-]/g, '');
        if (!/^\+\d{7,18}$/.test(cleanPhone)) {
            alert(currentLang === 'fr' 
                ? 'Veuillez entrer un numéro de téléphone valide avec code de pays (ex: +212 600 000 000).' 
                : 'Please enter a valid phone number with country code (e.g., +212 600 000 000).');
            return;
        }
        const email = document.getElementById('email').value.trim();
        const affiliation = document.getElementById('institution').value.trim();
        const positionKey = document.getElementById('position').value;
        const partTypeVal = document.querySelector('input[name="participation_type"]:checked').value;

        // Translate participation type
        let partTypeFr = '';
        let partTypeEn = '';
        if (partTypeVal === 'attendance') {
            partTypeFr = 'Présence Simple'; partTypeEn = 'Attendance Only';
        } else if (partTypeVal === 'communication') {
            partTypeFr = 'Communication Orale/Poster'; partTypeEn = 'Oral/Poster Communication';
        } else if (partTypeVal === 'workshops') {
            partTypeFr = 'Ateliers Uniquement'; partTypeEn = 'Workshops Only';
        } else {
            partTypeFr = 'Communication & Ateliers'; partTypeEn = 'Communication & Workshops';
        }

        // 2. Determine price based on current date (Deadline: Oct 1, 2026)
        const deadlineDate = new Date('2026-10-01');
        const currentDate = new Date();
        const isBeforeDeadline = currentDate < deadlineDate;

        const categoryData = feeMatrix[positionKey];
        let calculatedFee = '';
        
        if (categoryData) {
            if (categoryData.currency === 'MAD') {
                const amount = isBeforeDeadline ? categoryData.madBefore : categoryData.madAfter;
                calculatedFee = `${amount}.00 MAD`;
            } else {
                const amountMad = isBeforeDeadline ? categoryData.madBefore : categoryData.madAfter;
                const amountEur = isBeforeDeadline ? categoryData.eurBefore : categoryData.eurAfter;
                calculatedFee = `${amountMad}.00 MAD (${amountEur}.00 EUR)`;
            }
        } else {
            calculatedFee = 'A déterminder / To be determined';
        }

        // 3. Generate Registration Code
        const randPart = Math.random().toString(36).substring(2, 6).toUpperCase();
        const uniqueRegCode = `GIS-2026-${randPart}`;

        // 4. Save to LocalStorage (bypassing backend)
        const regRecord = {
            code: uniqueRegCode,
            lastName,
            firstName,
            country,
            city,
            phone,
            email,
            affiliation,
            position: categoryData ? categoryData.labelEn : positionKey,
            participationType: partTypeEn,
            fee: calculatedFee,
            dateRegistered: currentDate.toISOString()
        };

        const isComm = (partTypeVal === 'communication' || partTypeVal === 'comm_workshops');
        const isWork = (partTypeVal === 'workshops' || partTypeVal === 'comm_workshops');

        if (isComm) {
            regRecord.communicationTitle = document.getElementById('abstractTitle').value.trim();
            regRecord.communicantName = document.getElementById('communicantName').value.trim();
            regRecord.communicantAffiliation = document.getElementById('communicantAffiliation').value.trim();
            regRecord.coAuthors = document.getElementById('coAuthors').value.trim();
        }
        if (isWork) {
            regRecord.workshopSelection = document.getElementById('workshopSelect').value;
        }

        localStorage.setItem(uniqueRegCode, JSON.stringify(regRecord));

        // Envoi vers Google Sheets si l'URL est configurée
        if (GOOGLE_SCRIPT_URL) {
            fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(regRecord)
            }).catch(err => console.error("Échec de l'envoi vers Google Sheets:", err));
        }

        // 5. Populate Receipt Details
        document.getElementById('receiptCode').innerText = uniqueRegCode;
        document.getElementById('recName').innerText = `${firstName} ${lastName.toUpperCase()}`;
        document.getElementById('recEmail').innerText = email;
        document.getElementById('recAffiliation').innerText = `${affiliation} (${city}, ${country})`;
        
        // Show translations of values
        document.getElementById('recPartType').innerHTML = `
            <span class="lang-fr">${partTypeFr}</span>
            <span class="lang-en">${partTypeEn}</span>
        `;
        document.getElementById('recAmount').innerText = calculatedFee;

        // Populate Dynamic Receipt Details
        const recCommDetails = document.getElementById('recCommDetails');
        if (isComm) {
            recCommDetails.style.display = 'flex';
            document.getElementById('recCommTitle').innerText = document.getElementById('abstractTitle').value.trim();
            document.getElementById('recCommName').innerText = document.getElementById('communicantName').value.trim();
            document.getElementById('recCommAffil').innerText = document.getElementById('communicantAffiliation').value.trim();
            const coAuthorsVal = document.getElementById('coAuthors').value.trim();
            const recCoAuthorsContainer = document.getElementById('recCoAuthorsContainer');
            if (coAuthorsVal) {
                recCoAuthorsContainer.style.display = 'block';
                document.getElementById('recCoAuthors').innerText = coAuthorsVal;
            } else {
                recCoAuthorsContainer.style.display = 'none';
            }
        } else {
            recCommDetails.style.display = 'none';
        }

        const recWorkshopDetails = document.getElementById('recWorkshopDetails');
        if (isWork) {
            recWorkshopDetails.style.display = 'block';
            document.getElementById('recWorkshop').innerText = document.getElementById('workshopSelect').value;
        } else {
            recWorkshopDetails.style.display = 'none';
        }

        // Update instructions code labels
        document.querySelectorAll('.receipt-code-inline').forEach(el => {
            el.innerText = uniqueRegCode;
        });

        // 6. Toggle view
        formContainer.style.display = 'none';
        receiptView.style.display = 'block';

        // Smooth scroll to top of section
        document.getElementById('registration').scrollIntoView({ behavior: 'smooth' });
    });

    // --- Custom File Upload Card Handling ---
    const fileUploadCard = document.getElementById('fileUploadCard');
    const abstractFileInput = document.getElementById('abstractFile');
    const fileNamePreview = document.getElementById('fileNamePreview');
    const fileNameSpan = document.getElementById('fileNameSpan');
    const removeFileBtn = document.getElementById('removeFileBtn');
    const uploadCardText = fileUploadCard ? fileUploadCard.querySelector('.upload-card-text') : null;
    const uploadCardIcon = fileUploadCard ? fileUploadCard.querySelector('.upload-card-icon') : null;

    function resetCustomFileUpload() {
        if (abstractFileInput) {
            abstractFileInput.value = '';
            if (fileNamePreview) fileNamePreview.style.display = 'none';
            if (uploadCardText) uploadCardText.style.display = 'block';
            if (uploadCardIcon) uploadCardIcon.style.display = 'block';
            if (fileUploadCard) {
                fileUploadCard.style.pointerEvents = 'auto';
                fileUploadCard.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }
        }
    }

    if (fileUploadCard && abstractFileInput) {
        fileUploadCard.addEventListener('click', () => {
            abstractFileInput.click();
        });

        // Drag and drop event listeners
        ['dragenter', 'dragover'].forEach(eventName => {
            fileUploadCard.addEventListener(eventName, (e) => {
                e.preventDefault();
                fileUploadCard.classList.add('dragover');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            fileUploadCard.addEventListener(eventName, (e) => {
                e.preventDefault();
                fileUploadCard.classList.remove('dragover');
            }, false);
        });

        fileUploadCard.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files.length > 0) {
                abstractFileInput.files = files;
                updateFilePreview(files[0]);
            }
        });

        abstractFileInput.addEventListener('change', (e) => {
            if (abstractFileInput.files.length > 0) {
                updateFilePreview(abstractFileInput.files[0]);
            }
        });

        function updateFilePreview(file) {
            if (fileNameSpan) fileNameSpan.innerText = file.name;
            if (fileNamePreview) fileNamePreview.style.display = 'flex';
            if (uploadCardText) uploadCardText.style.display = 'none';
            if (uploadCardIcon) uploadCardIcon.style.display = 'none';
            fileUploadCard.style.pointerEvents = 'none'; // Lock card clicking while preview is shown
            fileUploadCard.style.borderColor = 'rgba(255, 255, 255, 0.1)';
        }

        if (removeFileBtn) {
            removeFileBtn.style.pointerEvents = 'auto';
            removeFileBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent opening file dialog
                resetCustomFileUpload();
            });
        }
    }

    backToFormBtn.addEventListener('click', () => {
        // Reset form
        regForm.reset();
        resetCustomFileUpload();
        toggleFormSections();

        // Toggle view back
        receiptView.style.display = 'none';
        formContainer.style.display = '';

        // Smooth scroll to registration
        document.getElementById('registration').scrollIntoView({ behavior: 'smooth' });
    });

    // --- 7. Main Committee Tabs Logic ---
    const tabBtns = document.querySelectorAll('.committee-tab-btn');
    const tabPanes = document.querySelectorAll('.committee-tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            btn.classList.add('active');
            const targetPane = document.getElementById(btn.getAttribute('data-tab'));
            if (targetPane) {
                targetPane.classList.add('active');
            }
        });
    });

    // --- 8. Organizing Sub-Tabs Logic ---
    const orgTabBtns = document.querySelectorAll('.organizing-tab-btn');
    const orgTabPanes = document.querySelectorAll('.organizing-tab-pane');

    orgTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            orgTabBtns.forEach(b => b.classList.remove('active'));
            orgTabPanes.forEach(p => p.classList.remove('active'));
            
            // Hide all dynamic subtitles
            const subtitles = document.querySelectorAll('.org-subtitle-item');
            subtitles.forEach(s => {
                s.style.display = 'none';
                s.classList.remove('active');
            });

            btn.classList.add('active');
            const targetPane = document.getElementById(btn.getAttribute('data-org-tab'));
            if (targetPane) {
                targetPane.classList.add('active');
            }

            // Show matching subtitle
            const targetSub = document.getElementById(`subtitle-${btn.getAttribute('data-org-tab')}`);
            if (targetSub) {
                targetSub.style.display = 'block';
                targetSub.classList.add('active');
            }
        });
    });
});

// --- Scientific Committee Show More / Show Less ---
function toggleScientificGrid() {
    const grid = document.querySelector('.strict-members-grid');
    const btn = document.getElementById('scientificToggleBtn');
    if (!grid || !btn) return;

    const isExpanded = grid.classList.toggle('expanded');
    btn.classList.toggle('expanded', isExpanded);

    // Update button text for both langs
    const frSpan = btn.querySelector('.lang-fr');
    const enSpan = btn.querySelector('.lang-en');
    if (frSpan) frSpan.innerHTML = isExpanded
        ? 'Voir moins <i class="ph ph-caret-down"></i>'
        : 'Voir plus <i class="ph ph-caret-down"></i>';
    if (enSpan) enSpan.innerHTML = isExpanded
        ? 'Show less <i class="ph ph-caret-down"></i>'
        : 'Show more <i class="ph ph-caret-down"></i>';
}

// --- RIB Lightbox Modal Zoom ---
document.addEventListener('DOMContentLoaded', () => {
    const ribImg = document.getElementById('ribImg');
    const lightbox = document.getElementById('ribLightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxCaption = document.getElementById('lightboxCaption');
    const closeBtn = document.querySelector('.lightbox-close');

    if (ribImg && lightbox && lightboxImg) {
        ribImg.addEventListener('click', () => {
            lightbox.style.display = 'flex';
            // Smooth fade-in
            setTimeout(() => {
                lightbox.style.opacity = '1';
                lightboxImg.style.transform = 'scale(1)';
            }, 10);

            lightboxImg.src = ribImg.src;
            if (lightboxCaption) {
                const isFr = document.body.getAttribute('data-lang') === 'fr';
                lightboxCaption.innerText = isFr 
                    ? 'RIB Bancaire Officiel - ENS Fès' 
                    : 'Official Bank RIB - ENS Fez';
            }
        });

        const closeLightbox = () => {
            lightbox.style.opacity = '0';
            lightboxImg.style.transform = 'scale(0.95)';
            setTimeout(() => {
                lightbox.style.display = 'none';
            }, 300);
        };

        if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', (e) => {
            // Only close if clicking the backdrop, close button, or caption area (not the image or copy button)
            const copyBtn = document.getElementById('lightboxCopyBtn');
            if (e.target === lightbox || e.target === closeBtn || e.target.classList.contains('lightbox-close')) {
                closeLightbox();
            }
        });

        // Copy RIB clipboard logic
        const copyBtn = document.getElementById('lightboxCopyBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const ribNumber = "310270100502470050850153";
                navigator.clipboard.writeText(ribNumber).then(() => {
                    // Update button content to show success
                    const isFr = document.body.getAttribute('data-lang') === 'fr';
                    const icon = copyBtn.querySelector('i');
                    const frSpan = copyBtn.querySelector('.lang-fr');
                    const enSpan = copyBtn.querySelector('.lang-en');

                    if (icon) {
                        icon.className = "ph ph-check";
                        icon.style.color = "#10b981";
                    }
                    if (frSpan) frSpan.innerText = "Copié !";
                    if (enSpan) enSpan.innerText = "Copied!";

                    // Reset button after 2 seconds
                    setTimeout(() => {
                        if (icon) {
                            icon.className = "ph ph-copy";
                            icon.style.color = "";
                        }
                        if (frSpan) frSpan.innerText = "Copier le RIB (24 chiffres)";
                        if (enSpan) enSpan.innerText = "Copy RIB (24 digits)";
                    }, 2000);
                }).catch(err => {
                    console.error("Could not copy text: ", err);
                });
            });
        }

        // Close on Escape key press
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.style.display === 'flex') {
                closeLightbox();
            }
        });
    }
});
