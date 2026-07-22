from http.server import BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse
import json

import pandas as pd
import requests


class handler(BaseHTTPRequestHandler):

    def do_GET(self):
        try:
            query_parameters = parse_qs(
                urlparse(self.path).query
            )

            username = query_parameters.get(
                "username",
                [""],
            )[0].strip()

            if not username:
                self.send_json(
                    {
                        "error": (
                            "Escribe un usuario de GitHub."
                        )
                    },
                    400,
                )
                return

            headers = {
                "Accept": "application/vnd.github+json",
                "User-Agent": "DevScope-GitHub-Analytics",
                "X-GitHub-Api-Version": "2022-11-28",
            }

            profile_response = requests.get(
                f"https://api.github.com/users/{username}",
                headers=headers,
                timeout=10,
            )

            if profile_response.status_code == 404:
                self.send_json(
                    {
                        "error": (
                            "El usuario de GitHub no existe."
                        )
                    },
                    404,
                )
                return

            if profile_response.status_code != 200:
                self.send_json(
                    {
                        "error": (
                            "No fue posible consultar el perfil."
                        )
                    },
                    profile_response.status_code,
                )
                return

            repositories_response = requests.get(
                (
                    "https://api.github.com/users/"
                    f"{username}/repos"
                ),
                params={
                    "per_page": 100,
                    "sort": "updated",
                    "direction": "desc",
                },
                headers=headers,
                timeout=10,
            )

            if repositories_response.status_code != 200:
                self.send_json(
                    {
                        "error": (
                            "No fue posible consultar "
                            "los repositorios."
                        )
                    },
                    repositories_response.status_code,
                )
                return

            profile = profile_response.json()
            repositories = repositories_response.json()

            result = self.calculate_kpis(
                profile,
                repositories,
            )

            self.send_json(result, 200)

        except requests.Timeout:
            self.send_json(
                {
                    "error": (
                        "GitHub tardó demasiado en responder."
                    )
                },
                504,
            )

        except requests.RequestException:
            self.send_json(
                {
                    "error": (
                        "Ocurrió un problema de conexión "
                        "con GitHub."
                    )
                },
                500,
            )

        except Exception as error:
            print(f"Unexpected error: {error}")

            self.send_json(
                {
                    "error": (
                        "Ocurrió un error inesperado."
                    )
                },
                500,
            )

    def calculate_kpis(self, profile, repositories):
        if not repositories:
            return {
                "username": profile.get("login"),
                "name": profile.get("name"),
                "bio": profile.get("bio"),
                "avatar_url": profile.get("avatar_url"),
                "profile_url": profile.get("html_url"),
                "location": profile.get("location"),
                "company": profile.get("company"),
                "created_at": profile.get("created_at"),
                "followers": profile.get("followers", 0),
                "following": profile.get("following", 0),
                "total_repositories": 0,
                "total_stars": 0,
                "total_forks": 0,
                "average_stars": 0,
                "main_language": "No especificado",
                "most_popular_repository": {
                    "name": "Sin repositorios",
                    "description": (
                        "Este usuario no tiene "
                        "repositorios públicos."
                    ),
                    "url": "",
                },
                "repositories": [],
            }

        dataframe = pd.DataFrame(repositories)

        required_columns = [
            "name",
            "description",
            "language",
            "stargazers_count",
            "forks_count",
            "html_url",
        ]

        for column in required_columns:
            if column not in dataframe.columns:
                dataframe[column] = None

        dataframe["stargazers_count"] = pd.to_numeric(
            dataframe["stargazers_count"],
            errors="coerce",
        ).fillna(0)

        dataframe["forks_count"] = pd.to_numeric(
            dataframe["forks_count"],
            errors="coerce",
        ).fillna(0)

        dataframe["language"] = dataframe[
            "language"
        ].fillna("No especificado")

        dataframe["description"] = dataframe[
            "description"
        ].fillna("Este repositorio no tiene descripción.")

        dataframe = dataframe.sort_values(
            by="stargazers_count",
            ascending=False,
        )

        total_repositories = int(len(dataframe))

        total_stars = int(
            dataframe["stargazers_count"].sum()
        )

        total_forks = int(
            dataframe["forks_count"].sum()
        )

        average_stars = round(
            float(
                dataframe["stargazers_count"].mean()
            ),
            2,
        )

        valid_languages = dataframe[
            dataframe["language"] != "No especificado"
        ]["language"]

        if valid_languages.empty:
            main_language = "No especificado"
        else:
            main_language = str(
                valid_languages.mode().iloc[0]
            )

        most_popular = dataframe.iloc[0]

        top_repositories = []

        for _, repository in dataframe.head(9).iterrows():
            top_repositories.append(
                {
                    "name": str(repository["name"]),
                    "description": str(
                        repository["description"]
                    ),
                    "language": str(
                        repository["language"]
                    ),
                    "stars": int(
                        repository["stargazers_count"]
                    ),
                    "forks": int(
                        repository["forks_count"]
                    ),
                    "url": str(repository["html_url"]),
                }
            )

        return {
            "username": profile.get("login"),
            "name": profile.get("name"),
            "bio": profile.get("bio"),
            "avatar_url": profile.get("avatar_url"),
            "profile_url": profile.get("html_url"),
            "location": profile.get("location"),
            "company": profile.get("company"),
            "created_at": profile.get("created_at"),
            "followers": profile.get("followers", 0),
            "following": profile.get("following", 0),
            "total_repositories": total_repositories,
            "total_stars": total_stars,
            "total_forks": total_forks,
            "average_stars": average_stars,
            "main_language": main_language,
            "most_popular_repository": {
                "name": str(most_popular["name"]),
                "description": str(
                    most_popular["description"]
                ),
                "url": str(
                    most_popular["html_url"]
                ),
            },
            "repositories": top_repositories,
        }

    def send_json(self, data, status_code):
        response = json.dumps(
            data,
            ensure_ascii=False,
        ).encode("utf-8")

        self.send_response(status_code)

        self.send_header(
            "Content-Type",
            "application/json; charset=utf-8",
        )

        self.send_header(
            "Access-Control-Allow-Origin",
            "*",
        )

        self.send_header(
            "Content-Length",
            str(len(response)),
        )

        self.end_headers()
        self.wfile.write(response)
