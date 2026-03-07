const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let newContent = content.replace(/JobHub/gi, 'Jobs Agent');

    if (content !== newContent) {
        fs.writeFileSync(filePath, newContent);
        console.log('Updated ' + filePath);
    }
}

function processDirectory(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!fullPath.includes('node_modules') && !fullPath.includes('.git') && !fullPath.includes('dist')) {
                processDirectory(fullPath);
            }
        } else {
            if (fullPath.endsWith('.tsx') || fullPath.endsWith('.html') || fullPath.endsWith('.ts')) {
                replaceInFile(fullPath);
            }
        }
    }
}

processDirectory('/Users/andybagus/Documents/Jobhub');
console.log('Done!');
