const form = document.getElementById("github-form");
const usernameInput = document.getElementById("username");
const searchButton = document.getElementById("search-button");
const buttonText = document.getElementById("button-text");

const statusMessage = document.getElementById("status-message");
const loadingSection = document.getElementById("loading-section");
const resultsSection = document.getElementById("resultados");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = usernameInput.value.trim();

    if (!username) {
        showMessage(
            "Por favor, escribe un usuario de GitHub.",
            true
        );
        return;
    }

    startLoading();

    try {
        const profileResponse = await fetch(
            `https://api.github.com/users/${encodeURIComponent(username)}`
        );

        if (profileResponse.status === 404) {
            throw new Error(
                "No encontramos ese usuario de GitHub."
            );
        }

        if (!profileResponse.ok) {
            throw new Error(
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
