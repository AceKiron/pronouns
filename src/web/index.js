document.addEventListener("DOMContentLoaded", async () => {
    const mainElement = document.querySelector("main");
    
    // Copyright notice
    const copyrightText = `© ${new Date().getFullYear()} Developed by <a href="https://mxace.dev" class="underline" target="_blank">MxAce.dev</a>`;
    const copyrightElements = mainElement.querySelectorAll("[data-type=copyright]");
    for (const element of copyrightElements) element.innerHTML = copyrightText;

    // Author age
    const authorAgeElements = mainElement.querySelectorAll("[data-type=author-age]");
    if (authorAgeElements.length) {
        fetch("/birthday.txt").then((res) => res.text()).then((res) => {
            const AUTHOR_AGE = new Date(Date.now() - Number.parseInt(res)).getUTCFullYear() - 1970;
            for (const element of authorAgeElements) element.innerText = AUTHOR_AGE;
        });
    }
});