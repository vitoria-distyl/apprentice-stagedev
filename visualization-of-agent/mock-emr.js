const http = require('http');

const mockHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Mock EMR System</title>
</head>
<body>
    <h1>Mock EMR Dashboard</h1>
    <div>
        <h2>Emily Carter - Patient Overview</h2>
        <button id="review-patient">Review Patient</button>
        <button id="encounter-notes">Encounter Notes</button>
        <button id="guidelines">Guidelines</button>
        <button id="labs-trends">Labs & Trends</button>
        <button id="benefits-claims">Benefits & Claims</button>
        <div id="prior-auth" style="display:none">
            <button id="add-comment">Add Comment</button>
            <textarea id="comment-text"></textarea>
        </div>
    </div>
    <script>
        document.getElementById('review-patient').onclick = () => console.log('Patient reviewed');
        document.getElementById('benefits-claims').onclick = () => {
            document.getElementById('prior-auth').style.display = 'block';
        };
    </script>
</body>
</html>
`;

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(mockHTML);
});

server.listen(4000, () => {
    console.log('🏥 Mock EMR System running on http://localhost:4000');
});