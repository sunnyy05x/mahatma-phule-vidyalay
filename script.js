document.addEventListener('DOMContentLoaded', () => {
    // Google Sheets CSV URL
    const sheetCsvUrl = 'https://docs.google.com/spreadsheets/d/1MUHhGCbLef7E9W0vDM9IWvyT-7EiWUKGjulHWlB35o8/gviz/tq?tqx=out:csv';

    // Fetch and parse the notices
    fetch(sheetCsvUrl)
        .then(response => response.text())
        .then(csvText => {
            const notices = parseCSVToObjects(csvText);
            renderNotices(notices);
        })
        .catch(error => {
            console.error('Error fetching notices:', error);
            document.getElementById('notice-container').innerHTML = '<p style="text-align:center; color:var(--primary-color);">Failed to load notices. Please try again later.</p>';
        });

    // Smooth scrolling for navigation links
    document.querySelectorAll('nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            if(targetId === "") return; // for logo
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70, // offset for fixed header
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Robust CSV parser to handle quotes and commas inside fields
function parseCSVToObjects(csv) {
    const arr = [];
    let quote = false;
    for (let row = 0, col = 0, c = 0; c < csv.length; c++) {
        let cc = csv[c], nc = csv[c+1];
        arr[row] = arr[row] || [];
        arr[row][col] = arr[row][col] || '';

        if (cc == '"' && quote && nc == '"') { arr[row][col] += cc; ++c; continue; }
        if (cc == '"') { quote = !quote; continue; }
        if (cc == ',' && !quote) { ++col; continue; }
        if (cc == '\r' && nc == '\n' && !quote) { ++row; col = 0; ++c; continue; }
        if (cc == '\n' && !quote) { ++row; col = 0; continue; }
        if (cc == '\r' && !quote) { ++row; col = 0; continue; }

        arr[row][col] += cc;
    }
    
    const result = [];
    // Skip header row (i = 0)
    for(let i=1; i<arr.length; i++) {
        if(arr[i].length >= 2 && (arr[i][0] || arr[i][1])) {
            result.push({
                date: arr[i][0] ? arr[i][0].trim() : '',
                title: arr[i][1] ? arr[i][1].trim() : '',
                description: arr[i][2] ? arr[i][2].trim() : ''
            });
        }
    }
    return result;
}

function renderNotices(notices) {
    const container = document.getElementById('notice-container');
    container.innerHTML = ''; // Clear loading text

    if (notices.length === 0) {
        container.innerHTML = '<p style="text-align:center;">No notices available at the moment.</p>';
        return;
    }

    notices.forEach(notice => {
        const item = document.createElement('div');
        item.className = 'notice-item';
        
        const dateHtml = notice.date ? `<div class="notice-date">${notice.date}</div>` : '';
        const titleHtml = notice.title ? `<div class="notice-title">${notice.title}</div>` : '';
        const descHtml = notice.description ? `<div class="notice-desc">${notice.description}</div>` : '';
        
        item.innerHTML = `${dateHtml}${titleHtml}${descHtml}`;
        container.appendChild(item);
    });
}
