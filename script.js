const form = document.getElementById("github-form");
const usernameInput = document.getElementById("username");
const analyzeButton = document.getElementById("analyze-button");

const statusMessage = document.getElementById("status-message");
const loadingSection = document.getElementById("loading-section");
const resultsSection = document.getElementById("resultados");

const newSearchButton = document.getElementById(
    "new-search-button"
);

const repositoryButton = document.getElementById(
    "repository-button"
);

const modal = document.getElementById("modal");

const closeModalButton = document.getElementById(
    "close-modal-button"
);

const demoProfiles = {
    octocat: {
        name: "The Octocat",
        username: "octocat",
        description:
            "Perfil de demostración utilizado para probar aplicaciones conectadas con GitHub.",
        repositories: [
            {
                name: "Hello-World",
                description:
                    "Repositorio de demostración para aprender los conceptos básicos de GitHub.",
                language: "JavaScript",
                stars: 128,
                forks: 42
            },
            {
                name: "Spoon-Knife",
                description:
                    "Proyecto utilizado para practicar forks, cambios y colaboraciones.",
                language: "HTML",
                stars: 97,
                forks: 35
            },
            {
                name: "GitHub-Guide",
                description:
                    "Guía sencilla para comenzar a trabajar con repositorios.",
                language: "CSS",
                stars: 64,
                forks: 18
            },
            {
                name: "Data-Dashboard",
                description:
                    "Dashboard de ejemplo para mostrar información y KPIs.",
                language: "JavaScript",
                stars: 51,
                forks: 12
            },
            {
                name: "Portfolio",
                description:
                    "Página personal con proyectos y experiencia profesional.",
                language: "HTML",
                stars: 34,
                forks: 7
            },
            {
                name: "API-Practice",
                description:
                    "Ejercicios básicos para aprender a trabajar con APIs.",
                language: "Python",
                stars: 22,
                forks: 5
            }
        ]
    },

    microsoft: {
        name: "Microsoft",
        username: "microsoft",
        description:
            "Organización tecnológica con proyectos de software, nube, inteligencia artificial y herramientas para desarrolladores.",
        repositories: [
            {
                name: "vscode",
                description:
                    "Editor de código moderno, rápido y extensible.",
                language: "TypeScript",
                stars: 172000,
                forks: 32100
            },
            {
                name: "TypeScript",
                description:
                    "Lenguaje basado en JavaScript que agrega tipos estáticos.",
                language: "TypeScript",
                stars: 105000,
                forks: 12900
            },
            {
                name: "PowerToys",
                description:
                    "Conjunto de herramientas para mejorar la productividad en Windows.",
                language: "C#",
                stars: 114000,
                forks: 6900
            },
            {
                name: "terminal",
                description:
                    "Terminal moderna para Windows.",
                language: "C++",
                stars: 97000,
                forks: 8500
            },
            {
                name: "playwright",
                description:
                    "Herramienta para automatización y pruebas de navegadores.",
                language: "TypeScript",
                stars: 72000,
                forks: 4100
            },
            {
                name: "ML-For-Beginners",
                description:
                    "Curso introductorio de machine learning.",
                language: "Jupyter Notebook",
                stars: 70000,
                forks: 15000
            }
        ]
    }
};

let selectedRepository = null;

form.addEventListener("submit", function (event) {
    event.preventDefault();

    const username = usernameInput.value.trim();

    if (!username) {
        showStatus(
            "Escribe un usuario antes de continuar.",
            true
        );

        usernameInput.focus();
        return;
    }

    startLoading();

    window.setTimeout(function () {
        const profile = createProfile(username);

        displayProfile(profile);

        stopLoading();

        resultsSection.classList.remove("hidden");

        showStatus(
            `Análisis completado para @${profile.username}.`
        );

        resultsSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }, 900);
});

newSearchButton.addEventListener("click", function () {
    usernameInput.value = "";

    resultsSection.classList.add("hidden");

    showStatus(
        "Escribe un nuevo usuario para comenzar."
    );

    document.getElementById("analizador").scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    window.setTimeout(function () {
        usernameInput.focus();
    }, 500);
});

repositoryButton.addEventListener("click", function () {
    if (selectedRepository) {
        openRepositoryModal(selectedRepository);
    }
});

closeModalButton.addEventListener("click", closeModal);

modal.addEventListener("click", function (event) {
    if (event.target === modal) {
        closeModal();
    }
});

document.addEventListener("keydown", function (event) {
    if (
        event.key === "Escape" &&
        !modal.classList.contains("hidden")
    ) {
        closeModal();
    }
});

function createProfile(username) {
    const normalizedUsername = username.toLowerCase();

    if (demoProfiles[normalizedUsername]) {
        return demoProfiles[normalizedUsername];
    }

    const seed = calculateSeed(normalizedUsername);

    const languages = [
        "JavaScript",
        "Python",
        "HTML",
        "TypeScript",
        "CSS",
        "Java"
    ];

    const repositoryNames = [
        "Portfolio-App",
        "Data-Dashboard",
        "Task-Manager",
        "Analytics-Project",
        "Web-Application",
        "Automation-Tools"
    ];

    const descriptions = [
        "Aplicación moderna para mostrar proyectos y experiencia.",
        "Dashboard de datos con indicadores importantes.",
        "Sistema sencillo para organizar tareas y pendientes.",
        "Proyecto de análisis y visualización de información.",
        "Aplicación web responsive creada para practicar desarrollo.",
        "Herramientas para automatizar tareas repetitivas."
    ];

    const repositories = repositoryNames.map(
        function (name, index) {
            return {
                name:
                    normalizedUsername +
                    "-" +
                    name.toLowerCase(),

                description: descriptions[index],

                language:
                    languages[
                        (seed + index) % languages.length
                    ],

                stars:
                    ((seed * (index + 3)) % 95) + 8,

                forks:
                    ((seed * (index + 2)) % 28) + 2
            };
        }
    );

    return {
        name: formatUsername(username),
        username: normalizedUsername,
        description:
            "Desarrollador interesado en crear aplicaciones, analizar datos y aprender nuevas tecnologías.",
        repositories
    };
}

function displayProfile(profile) {
    const analysis = calculateKPIs(profile.repositories);

    document.getElementById(
        "profile-avatar"
    ).textContent = getInitials(profile.name);

    document.getElementById(
        "profile-name"
    ).textContent = profile.name;

    document.getElementById(
        "profile-username"
    ).textContent = `@${profile.username}`;

    document.getElementById(
        "profile-description"
    ).textContent = profile.description;

    document.getElementById(
        "total-repositories"
    ).textContent = formatNumber(
        analysis.totalRepositories
    );

    document.getElementById(
        "total-stars"
    ).textContent = formatNumber(
        analysis.totalStars
    );

    document.getElementById(
        "total-forks"
    ).textContent = formatNumber(
        analysis.totalForks
    );

    document.getElementById(
        "average-stars"
    ).textContent = analysis.averageStars.toFixed(1);

    document.getElementById(
        "popular-repository"
    ).textContent = analysis.popularRepository.name;

    document.getElementById(
        "popular-description"
    ).textContent =
        analysis.popularRepository.description;

    document.getElementById(
        "main-language"
    ).textContent = analysis.mainLanguage;

    selectedRepository = analysis.popularRepository;

    displayRepositories(analysis.sortedRepositories);
}

function calculateKPIs(repositories) {
    const totalRepositories = repositories.length;

    const totalStars = repositories.reduce(
        function (total, repository) {
            return total + repository.stars;
        },
        0
    );

    const totalForks = repositories.reduce(
        function (total, repository) {
            return total + repository.forks;
        },
        0
    );

    const averageStars =
        totalRepositories > 0
            ? totalStars / totalRepositories
            : 0;

    const sortedRepositories = [...repositories].sort(
        function (repositoryA, repositoryB) {
            return repositoryB.stars - repositoryA.stars;
        }
    );

    const popularRepository = sortedRepositories[0];

    const mainLanguage = calculateMainLanguage(
        repositories
    );

    return {
        totalRepositories,
        totalStars,
        totalForks,
        averageStars,
        popularRepository,
        mainLanguage,
        sortedRepositories
    };
}

function calculateMainLanguage(repositories) {
    const languageCount = {};

    repositories.forEach(function (repository) {
        const language = repository.language;

        languageCount[language] =
            (languageCount[language] || 0) + 1;
    });

    const sortedLanguages = Object.entries(
        languageCount
    ).sort(function (languageA, languageB) {
        return languageB[1] - languageA[1];
    });

    return sortedLanguages[0][0];
}

function displayRepositories(repositories) {
    const repositoryList = document.getElementById(
        "repository-list"
    );

    repositoryList.innerHTML = "";

    repositories.forEach(function (repository) {
        const card = document.createElement("article");

        card.className = "repository-card";

        const title = document.createElement("h3");
        title.textContent = repository.name;

        const description = document.createElement("p");
        description.className = "repository-description";
        description.textContent = repository.description;

        const stats = document.createElement("div");
        stats.className = "repository-stats";

        const language = document.createElement("span");
        language.textContent = `● ${repository.language}`;

        const stars = document.createElement("span");
        stars.textContent =
            `⭐ ${formatNumber(repository.stars)}`;

        const forks = document.createElement("span");
        forks.textContent =
            `⑂ ${formatNumber(repository.forks)}`;

        stats.append(language, stars, forks);

        const detailsButton = document.createElement(
            "button"
        );

        detailsButton.type = "button";
        detailsButton.className =
            "repository-details-button";
        detailsButton.textContent = "Ver detalles";

        detailsButton.addEventListener(
            "click",
            function () {
                openRepositoryModal(repository);
            }
        );

        card.append(
            title,
            description,
            stats,
            detailsButton
        );

        repositoryList.appendChild(card);
    });
}

function openRepositoryModal(repository) {
    document.getElementById(
        "modal-title"
    ).textContent = repository.name;

    document.getElementById(
        "modal-description"
    ).textContent = repository.description;

    document.getElementById(
        "modal-stars"
    ).textContent = formatNumber(repository.stars);

    document.getElementById(
        "modal-forks"
    ).textContent = formatNumber(repository.forks);

    document.getElementById(
        "modal-language"
    ).textContent = repository.language;

    modal.classList.remove("hidden");
    modal.setAttribute("aria-hidden", "false");

    closeModalButton.focus();
}

function closeModal() {
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
}

function startLoading() {
    analyzeButton.disabled = true;
    analyzeButton.textContent = "Analizando...";

    loadingSection.classList.remove("hidden");
    resultsSection.classList.add("hidden");

    showStatus(
        "Procesando los datos del perfil..."
    );
}

function stopLoading() {
    analyzeButton.disabled = false;
    analyzeButton.textContent = "Analizar perfil";

    loadingSection.classList.add("hidden");
}

function showStatus(message, isError = false) {
    statusMessage.textContent = message;

    statusMessage.classList.toggle(
        "status-error",
        isError
    );
}

function calculateSeed(value) {
    return value
        .split("")
        .reduce(function (total, character) {
            return total + character.charCodeAt(0);
        }, 0);
}

function formatUsername(username) {
    return username
        .split(/[-_.]/)
        .filter(Boolean)
        .map(function (word) {
            return (
                word.charAt(0).toUpperCase() +
                word.slice(1)
            );
        })
        .join(" ");
}

function getInitials(name) {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(function (word) {
            return word.charAt(0).toUpperCase();
        })
        .join("");
}

function formatNumber(number) {
    return Number(number).toLocaleString("es-MX");
}            throw new Error(
                "GitHub no pudo responder. Intenta nuevamente."
            );
        }

        const profile = await profileResponse.json();

        const repositoriesResponse = await fetch(
            `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated`
        );

        if (!repositoriesResponse.ok) {
            throw new Error(
                "No fue posible cargar los repositorios."
            );
        }

        const repositories = await repositoriesResponse.json();

        const analysis = calculateKPIs(repositories);

        displayProfile(profile);
        displayKPIs(analysis);
        displayRepositories(analysis.sortedRepositories);

        resultsSection.classList.remove("hidden");

        showMessage(
            `Análisis completado para @${profile.login}.`
        );

        resultsSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    } catch (error) {
        resultsSection.classList.add("hidden");
        showMessage(error.message, true);

    } finally {
        stopLoading();
    }
});

function calculateKPIs(repositories) {
    const validRepositories = Array.isArray(repositories)
        ? repositories
        : [];

    const totalRepositories = validRepositories.length;

    const totalStars = validRepositories.reduce(
        (total, repository) => {
            return total + (repository.stargazers_count || 0);
        },
        0
    );

    const totalForks = validRepositories.reduce(
        (total, repository) => {
            return total + (repository.forks_count || 0);
        },
        0
    );

    const averageStars = totalRepositories > 0
        ? totalStars / totalRepositories
        : 0;

    const sortedRepositories = [...validRepositories].sort(
        (repositoryA, repositoryB) => {
            return (
                repositoryB.stargazers_count -
                repositoryA.stargazers_count
            );
        }
    );

    const popularRepository = sortedRepositories[0] || null;

    const mainLanguage = calculateMainLanguage(
        validRepositories
    );

    return {
        totalRepositories,
        totalStars,
        totalForks,
        averageStars,
        popularRepository,
        mainLanguage,
        sortedRepositories
    };
}

function calculateMainLanguage(repositories) {
    const languageCounts = {};

    repositories.forEach((repository) => {
        const language = repository.language;

        if (language) {
            languageCounts[language] =
                (languageCounts[language] || 0) + 1;
        }
    });

    const languages = Object.entries(languageCounts);

    if (languages.length === 0) {
        return "No especificado";
    }

    languages.sort((languageA, languageB) => {
        return languageB[1] - languageA[1];
    });

    return languages[0][0];
}

function displayProfile(profile) {
    document.getElementById("profile-avatar").src =
        profile.avatar_url;

    document.getElementById("profile-avatar").alt =
        `Avatar de ${profile.login}`;

    document.getElementById("profile-name").textContent =
        profile.name || profile.login;

    document.getElementById("profile-username").textContent =
        `@${profile.login}`;

    document.getElementById("profile-bio").textContent =
        profile.bio || "Este usuario no tiene una biografía pública.";

    document.getElementById("profile-location").textContent =
        `📍 ${profile.location || "Ubicación no disponible"}`;

    document.getElementById("profile-company").textContent =
        `🏢 ${profile.company || "Empresa no disponible"}`;

    const accountDate = new Date(
        profile.created_at
    ).toLocaleDateString("es-MX", {
        year: "numeric",
        month: "long"
    });

    document.getElementById("profile-created").textContent =
        `📅 Miembro desde ${accountDate}`;

    document.getElementById("followers").textContent =
        formatNumber(profile.followers);

    document.getElementById("following").textContent =
        formatNumber(profile.following);

    const profileLink = document.getElementById(
        "github-profile-link"
    );

    profileLink.href = profile.html_url;
}

function displayKPIs(analysis) {
    document.getElementById(
        "total-repositories"
    ).textContent = formatNumber(
        analysis.totalRepositories
    );

    document.getElementById(
        "total-stars"
    ).textContent = formatNumber(
        analysis.totalStars
    );

    document.getElementById(
        "total-forks"
    ).textContent = formatNumber(
        analysis.totalForks
    );

    document.getElementById(
        "average-stars"
    ).textContent = analysis.averageStars.toFixed(1);

    document.getElementById(
        "main-language"
    ).textContent = analysis.mainLanguage;

    const popularName = document.getElementById(
        "popular-repository"
    );

    const popularDescription = document.getElementById(
        "popular-repository-description"
    );

    const popularLink = document.getElementById(
        "popular-repository-link"
    );

    if (analysis.popularRepository) {
        popularName.textContent =
            analysis.popularRepository.name;

        popularDescription.textContent =
            analysis.popularRepository.description ||
            "Este repositorio no tiene una descripción.";

        popularLink.href =
            analysis.popularRepository.html_url;

        popularLink.classList.remove("hidden");
    } else {
        popularName.textContent = "Sin repositorios";
        popularDescription.textContent =
            "Este usuario todavía no tiene repositorios públicos.";

        popularLink.classList.add("hidden");
    }
}

function displayRepositories(repositories) {
    const repositoryList = document.getElementById(
        "repository-list"
    );

    repositoryList.innerHTML = "";

    const topRepositories = repositories.slice(0, 6);

    if (topRepositories.length === 0) {
        repositoryList.innerHTML = `
            <article class="repository-card">
                <h3>Sin repositorios</h3>
                <p class="repository-card-description">
                    Este usuario no tiene repositorios públicos.
                </p>
            </article>
        `;

        return;
    }

    topRepositories.forEach((repository) => {
        const card = document.createElement("article");
        card.className = "repository-card";

        const safeDescription =
            repository.description ||
            "Este repositorio no tiene descripción.";

        const language =
            repository.language || "No especificado";

        card.innerHTML = `
            <h3>${escapeHTML(repository.name)}</h3>

            <p class="repository-card-description">
                ${escapeHTML(safeDescription)}
            </p>

            <div class="repository-data">
                <span>● ${escapeHTML(language)}</span>
                <span>⭐ ${formatNumber(repository.stargazers_count)}</span>
                <span>⑂ ${formatNumber(repository.forks_count)}</span>
            </div>

            <a
                href="${repository.html_url}"
                target="_blank"
                rel="noopener noreferrer"
            >
                Ver proyecto ↗
            </a>
        `;

        repositoryList.appendChild(card);
    });
}

function startLoading() {
    searchButton.disabled = true;
    buttonText.textContent = "Analizando...";
    loadingSection.classList.remove("hidden");
    resultsSection.classList.add("hidden");

    showMessage(
        "Conectando con GitHub y procesando los datos..."
    );
}

function stopLoading() {
    searchButton.disabled = false;
    buttonText.textContent = "Analizar perfil";
    loadingSection.classList.add("hidden");
}

function showMessage(message, isError = false) {
    statusMessage.textContent = message;

    statusMessage.classList.toggle(
        "status-error",
        isError
    );
}

function formatNumber(number) {
    return Number(number || 0).toLocaleString("es-MX");
}

function escapeHTML(value) {
    const element = document.createElement("div");
    element.textContent = value;
    return element.innerHTML;
}
