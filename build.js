const fs = require("fs");
const UglifyJS = require("uglify-js");
const path = require("path");
const sass = require("sass");
const copydir = require("copy-dir");
const config = require("./config/env.asf");
const fse = require("fs-extra");

const htmlTpl = `
<!--
AUTOGENERATED. DON'T MODIFY
-->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
<!-- NOT include bootstrap because echarts-www already has one -->
<link rel="stylesheet" href="https://unpkg.com/bootstrap@3.4.1/dist/css/bootstrap.min.css">
<script src="https://unpkg.com/jquery@3.5.1/dist/jquery.min.js"></script>
<script src="https://unpkg.com/bootstrap@3.4.1/dist/js/bootstrap.min.js"></script>
{{body}}
</body>
</html>
`;

function build() {
  function bundleJS(files) {
    const output = [];
    for (let filePath of files) {
      output.push(fs.readFileSync(path.resolve(__dirname, filePath), "utf-8"));
    }
    const outputCode = output.join("\n");
    const result = UglifyJS.minify(outputCode, {
      mangle: true,
    });
    return result.code;
  }

  // Bundle sass
  const cssResult = sass.renderSync({
    file: path.resolve(__dirname, "app/styles/main.scss"),
    outputStyle: "compressed",
  });

  ["en", "zh"].forEach(function (lang) {
    const jsPostfix = lang === "en" ? "_en" : "";
    fs.writeFileSync(
      path.resolve(__dirname, `app/${lang}/theme-builder/app.min.js`),
      bundleJS([
        `app/scripts/components${jsPostfix}.js`,
        `app/scripts/options${jsPostfix}.js`,
        `app/scripts/main${jsPostfix}.js`,
      ]),
      "utf-8"
    );
    // Write css
    fs.writeFileSync(
      path.resolve(__dirname, `app/${lang}/theme-builder/main.css`),
      cssResult.css
    );

    // Build html
    fs.writeFileSync(
      path.resolve(__dirname, `app/${lang}/index.html`),
      htmlTpl.replace(
        "{{body}}",
        fs.readFileSync(path.resolve(__dirname, `app/${lang}/body.html`))
      )
    );

    copydir.sync(
      path.resolve(__dirname, "app/themes"),
      `app/${lang}/theme-builder/themes`
    );
  });
}

build();

if (process.argv.indexOf("--release") >= 0) {
  if (!fs.existsSync(config.releaseDestDir)) {
    throw new Error("echarts-website project not exists");
  }
  if (!fs.existsSync(config.ecWWWGeneratedDir.replace("_generated", ""))) {
    throw new Error("echarts-www project not exists");
  }

  ["en", "zh"].forEach(function (lang) {
    fse.ensureDirSync(
      path.join(config.ecWWWGeneratedDir, `${lang}/theme-builder`)
    );
    fse.ensureDirSync(
      path.join(config.releaseDestDir, `${lang}/theme-builder`)
    );

    fs.copyFileSync(
      path.resolve(__dirname, `app/${lang}/body.html`),
      path.join(config.ecWWWGeneratedDir, `${lang}/theme-builder/body.html`)
    );
    copydir.sync(
      path.resolve(__dirname, `app/${lang}/theme-builder`),
      path.join(config.releaseDestDir, `${lang}/theme-builder`)
    );
  });
}
