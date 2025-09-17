#!/usr/bin/env node

const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");

const args = yargs(hideBin(process.argv)).parse();

if (args.out === undefined || args.yaml === undefined || args["out-temp"] === undefined) {
    console.error("Missing required command line arguments. Make sure you have at least an --out, an --out-temp, and a --yaml flag set.");
    process.exit(1);
}

(async()=>{
    const fs = require("fs");
    const fsPromises = require("fs/promises");
    const path = require("path");

    const yaml = require("yaml");
    const nunjucks = require("nunjucks");
    const randomStringGenerator = require("random-string-generator");

    // Initialization
    await fsPromises.mkdir(args["out-temp"], { recursive: true });
    if (fs.existsSync(args.out)) await fsPromises.rm(args.out, { recursive: true });
    await fsPromises.mkdir(args.out, { recursive: true });

    // Main process
    if (args.assets !== undefined) await Promise.all(fs.readdirSync(path.join(args.assets)).map((asset) => fsPromises.copyFile(path.join(args.assets, asset), path.join(args.out, asset))));
    
    const doc = yaml.parse(await fsPromises.readFile(args.yaml, "utf-8"));

    const JS_INDEX = `/index-${randomStringGenerator()}.js`;

    await Promise.all([
        fsPromises.copyFile(path.join(__dirname, "web/favicon.svg"), path.join(args.out, "favicon.svg")),
        fsPromises.copyFile(path.join(__dirname, "web/index.js"), path.join(args.out, JS_INDEX)),
        fsPromises.copyFile(path.join(__dirname, "web/index.njk"), path.join(args["out-temp"], "index.njk")),
        fsPromises.copyFile(path.join(__dirname, "web/template.njk"), path.join(args["out-temp"], "template.njk"))
    ]);

    if (doc.metadata.birthday !== undefined) await fsPromises.writeFile(path.join(args.out, "birthday.txt"), new Date(doc.metadata.birthday.year, doc.metadata.birthday.month - 1, doc.metadata.birthday.day).getTime().toString());

    await fsPromises.writeFile(path.join(args.out, "index.html"), nunjucks.render(path.join(args["out-temp"], "index.njk"), {
        WEB_URL: doc.metadata.web.url,
        WEB_AUTHOR: doc.metadata.web.author,
        WEB_DESCRIPTION: doc.metadata.web.description,

        JS_INDEX,

        YAML: doc
    }));

    // Cleanup
    await fsPromises.rm(args["out-temp"], { recursive: true });
})();