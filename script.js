const form = document.getElementById("github-form");
const usernameInput = document.getElementById("username");
const analyzeButton = document.getElementById("analyze-button");

const statusMessage = document.getElementById("status-message");
const loadingSection = document.getElementById("loading-section");
const resultsSection = document.getElementById("resultados");

const newSearchButton = document.getElementById(
    "new-search-button"
);

form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const username = usernameInput.value.trim();

    if (!username) {
        showStatus(
            "Escribe un usuario de GitHub.",
            true
        );

        usernameInput.focus();
        return;
    }

    startLoading();

    try {
        const response = await fetch(
            `/api/kpi?username=${encodeURIComponent(username)}`
        );

        let data;

        try {
            data = await response.json();
        } catch {
            throw new Error(
                "La API no respondió correctamente."
            );
        }

        if (!response.ok) {
            throw new Error(
                data.error ||
                "No fue posible consultar el perfil."
            );
        }

        displayProfile(data);
        displayRepositories(data.repositories);

        resultsSection.classList.remove("hidden");

        showStatus(
            `Análisis completado para @${data.username}.`
        );

        resultsSection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    } catch (error) {
        resultsSection.classList.add("hidden");
        showStatus(error.message, true);

    } finally {
        stopLoading();
    }
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

function displayProfile(data) {
    const avatar = document.getElementById(
        "profile-avatar"
    );

    avatar.src = data.avatar_url;
    avatar.alt = `Avatar de ${data.username}`;

    document.getElementById(
        "profile-name"
    ).textContent = data.name || data.username;

    document.getElementById(
        "profile-username"
    ).textContent = `@${data.username}`;

    document.getElementById(
        "profile-bio"
    ).textContent =
        data.bio ||
        "Este usuario no tiene una biografía pública.";

    document.getElementById(
        "profile-location"
    ).textContent =
        `📍 ${data.location || "Ubicación no disponible"}`;

    document.getElementById(
        "profile-company"
    ).textContent =
        `🏢 ${data.company || "Empresa no disponible"}`;

    const accountDate = new Date(
        data.created_at
    ).toLocaleDateString("es-MX", {
        year: "numeric",
        month: "long"
    });

    document.getElementById(
        "profile-created"
    ).textContent =
        `📅 Miembro desde ${accountDate}`;

    document.getElementById(
        "followers"
    ).textContent = formatNumber(data.followers);

    document.getElementById(
        "following"
    ).textContent = formatNumber(data.following);

    document.getElementById(
        "total-repositories"
    ).textContent = formatNumber(
        data.total_repositories
    );

    document.getElementById(
        "total-stars"
    ).textContent = formatNumber(
        data.total_stars
    );

    document.getElementById(
        "total-forks"
    ).textContent = formatNumber(
        data.total_forks
    );

    document.getElementById(
        "average-stars"
    ).textContent = Number(
        data.average_stars
    ).toFixed(1);

    document.getElementById(
        "popular-repository"
    ).textContent =
        data.most_popular_repository.name;

    document.getElementById(
        "popular-description"
    ).textContent =
        data.most_popular_repository.description ||
        "Este repositorio no tiene descripción.";

    document.getElementById(
        "main-language"
    ).textContent =
        data.main_language ||
        "No especificado";

    document.getElementById(
        "github-profile-link"
    ).href = data.profile_url;

    const popularLink = document.getElementById(
        "popular-repository-link"
    );

    if (data.most_popular_repository.url) {
        popularLink.href =
            data.most_popular_repository.url;

        popularLink.classList.remove("hidden");
    } else {
        popularLink.classList.add("hidden");
    }
}

function displayRepositories(repositories) {
    const repositoryList = document.getElementById(
        "repository-list"
    );

    repositoryList.innerHTML = "";

    if (!repositories || repositories.length === 0) {
        repositoryList.innerHTML = `
            <article class="repository-card">
                <h3>Sin repositorios</h3>

                <p class="repository-description">
                    Este usuario no tiene repositorios públicos.
                </p>
            </article>
        `;

        return;
    }

    repositories.forEach(function (repository) {
        const card = document.createElement("article");
        card.className = "repository-card";

        const title = document.createElement("h3");
        title.textContent = repository.name;

        const description = document.createElement("p");
        description.className = "repository-description";
        description.textContent =
            repository.description ||
            "Este repositorio no tiene descripción.";

        const stats = document.createElement("div");
        stats.className = "repository-stats";

        const language = document.createElement("span");
        language.textContent =
            `● ${repository.language || "No especificado"}`;

        const stars = document.createElement("span");
        stars.textContent =
            `⭐ ${formatNumber(repository.stars)}`;

        const forks = document.createElement("span");
        forks.textContent =
            `⑂ ${formatNumber(repository.forks)}`;

        stats.append(language, stars, forks);

        const repositoryLink = document.createElement("a");
        repositoryLink.href = repository.url;
        repositoryLink.target = "_blank";
        repositoryLink.rel = "noopener noreferrer";
        repositoryLink.textContent = "Ver repositorio ↗";

        card.append(
            title,
            description,
            stats,
            repositoryLink
        );

        repositoryList.appendChild(card);
    });
}

function startLoading() {
    analyzeButton.disabled = true;
    analyzeButton.textContent = "Analizando...";

    loadingSection.classList.remove("hidden");
    resultsSection.classList.add("hidden");

    showStatus(
        "Consultando GitHub y calculando los KPIs..."
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

function formatNumber(number) {
    return Number(number || 0).toLocaleString("es-MX");
}
