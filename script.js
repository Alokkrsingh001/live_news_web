class NewsApp {
    constructor() {
        this.API_KEY = "3f8a4f44711b4644a6363a065e6b991f";

        this.BaseUrl = "https://api.allorigins.win/get?url=" + encodeURIComponent("https://newsapi.org/v2");

        this.state = {
            category: "general",
            page: 1,
            loading: false,
            query: "",
            articles: [],
            totalResults: Infinity
        }

        this.debounceTimeout = null;

        this.init();
    }

    init() {
        this.setupTheme();
        this.setupEvents();
        this.loadNews();
    }


    setupTheme() {
        const theme = localStorage.getItem("theme") || "light";

        document.documentElement.setAttribute("data-theme", theme);

        document.querySelector(".themeIcon").textContent = theme === "dark" ? "☀️" : "🌙";



        document.getElementById("themeToggle").onclick = () => {
            const current = document.documentElement.getAttribute("data-theme");
            const newTheme = current === "dark" ? "light" : "dark";

            document.documentElement.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);

            document.querySelector(".themeIcon").textContent = newTheme === "dark" ? "☀️" : "🌙";
        };
    }

        setupEvents() {
            document.querySelectorAll(".category-btn").forEach(btn => {
                btn.onclick = () => this.changeCategory(btn.dataset.category);
            })

            document.getElementById("searchInput").addEventListener("input", (e) => {
                this.debouncedSearch(e.target.value);
            });



            window.onscroll = () => {
                const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

                if (scrollTop + clientHeight >= scrollHeight - 1000 && !this.state.loading) {
                    if (this.state.articles.length < this.state.totalResults){
                        this.loadMore();
                    }else {
                        this.showEndMessage();
                    }
                }
            }


            document.onclick = (e) => {
                const card = e.target.closest(".news-card");
                if (card?.dataset.url) {
                    window.open(card.dataset.url, "_blank");
                }
            };
        }

        
        changeCategory(category){
            if (category === this.state.category) return;

            document.querySelectorAll(".category-btn").forEach(btn => {
                btn.classList.remove("active");
            });

            document.querySelector(`[data-category="${category}"]`).classList.add("active");

            this.resetSate({category,query: ""});
            document.getElementById("searchInput").value = "";


            this.loadNews();


        }



        search(query) {
            this.resetSate({query});
            this.loadNews();
        }

        debouncedSearch(query) {
            clearTimeout(this.debounceTimeout);
            this.debounceTimeout = setTimeout(() => {
                this.search(query);
            }, 500);
        }

        async loadNews() {
            if(this.state.loading) return;
            this.hideEndMessage();
            this.toggleLoading(true);

            try {
                const url = this.buildUrl();
                const response = await fetch(url);
                const proxyData = await response.json();
                const data = JSON.parse(proxyData.contents);
                if (data.status == "ok" && data.articles.length > 0) {
                    this.state.articles = data.articles;
                    this.state.totalResults = data.totalResults;
                    this.renderNews(data.articles);
                    this.hideError();
                } else {
                    this.showError(data.message || "No articles found for the selected category.");
                }

            }catch (error) {
                console.log("API request failed, using mock data:", error);
                // Use mock data for testing
                const mockData = {
                    status: "ok",
                    totalResults: 20,
                    articles: [
                        {
                            title: "Sample News Article 1",
                            description: "This is a sample news article for testing purposes.",
                            url: "https://example.com/article1",
                            urlToImage: null,
                            source: { name: "Sample News" },
                            publishedAt: new Date().toISOString()
                        },
                        {
                            title: "Sample News Article 2",
                            description: "Another sample news article for testing.",
                            url: "https://example.com/article2",
                            urlToImage: null,
                            source: { name: "Sample News" },
                            publishedAt: new Date().toISOString()
                        }
                    ]
                };
                this.state.articles = mockData.articles;
                this.state.totalResults = mockData.totalResults;
                this.renderNews(mockData.articles);
                this.hideError();
            }
            this.toggleLoading(false);
        }


        resetSate(updates) {
            this.state = {
                ...this.state,
                ...updates,
                page: 1,
                articles: [],
                totalResults: Infinity,
                loading: false
            };

            document.getElementById("newsGrid").innerHTML = "";
            this.hideEndMessage();
        }

        async loadMore() {
            if (this.state.articles.length >= this.state.totalResults){
                this.showEndMessage();
                window.onscroll = null;
                this.toggleLoading(false);
                return;
            }

            this.state.page ++;
            this.toggleLoading(true);

            try {
                const url = this.buildUrl();
                const response = await fetch(url);
                const data = await response.json();

                if (data.status == "ok" && data.articles.length > 0) {
                    this.state.articles.push(...data.articles);
                    this.renderNews(data.articles,true);

                    if (this.state.articles.length >= this.state.totalResults) {
                        this.showEndMessage();
                        window.onscroll = null;

                    }
                } else{
                    this.showEndMessage();
                    window.onscroll = null;
                       
                }
            }catch (error) {
                console.error(error);
                this.state.page--;
            }

            this.toggleLoading(false);
        }

        buildUrl() {
            const params = new URLSearchParams({
                page: this.state.page,
                pageSize: 20,
                apiKey: this.API_KEY
            });

            if (this.state.query) {
                params.append("q", this.state.query);
                params.append("language", "en");
                return `${this.BaseUrl}/everything?${params}`;
            } else {
                params.append("country", "us");
                params.append("category", this.state.category);
                return `${this.BaseUrl}/top-headlines?${params}`;
            }
        }

        renderNews(articles, append = false) {
            const grid = document.getElementById("newsGrid");
            if (!append) grid.innerHTML = "";

            articles.forEach(article => {
                const card = document.createElement("div");
                card.className = "news-card";
                 card.dataset.url = article.url;

                const img = article.urlToImage ? `<img src="${article.urlToImage}" alt="${article.title}" class="news-image" onerror="this.outerHTML='<div class=\\'news-image default-image\\'>YOUR NEWS</div>'">`:`<div class="news-image default-image">YOUR NEWS</div>`;

                card.innerHTML = `
                    ${img}
                    <div class="news-content">
                      <h3 class="news-title">${article.title}</h3>
                      <p class='news-description'>${article.description || 'No description available.'}</p>
                      <div class="news-meta">
                        <span class="news-source">${article.source.name}</span>
                        <span class="news-date">${new Date(article.publishedAt).toLocaleDateString("en-US",{
                            month:"short",
                            day:"numeric",
                            year:"numeric"
                        })}</span>
                    </div>
                    </div>
                `;
                grid.appendChild(card);
            })
        }

        showError(msg) {
            const error = document.getElementById("error");
            error.textContent = msg;
            error.style.display = "block";
        }

        hideError() {
            document.getElementById("error").style.display = "none";
        }

        showEndMessage() {
            document.getElementById("endMessage").style.display = "block";
        }

        hideEndMessage() {
            document.getElementById("endMessage").style.display = "none";
        }


        toggleLoading(show) {
            this.state.loading = show;
            document.getElementById("loading").style.display = show ? "block" : "none";
        }




}

document.addEventListener('DOMContentLoaded', ()=> new NewsApp());