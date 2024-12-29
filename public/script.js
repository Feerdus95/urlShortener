document.getElementById('url-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const urlInput = document.getElementById('url-input');
    const resultDiv = document.getElementById('result');
    
    try {
        const response = await fetch('/api/shorturl', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: urlInput.value })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.error) {
            resultDiv.innerHTML = `
                <div class="error">
                    Error: ${data.error}
                </div>
            `;
        } else {
            const shortUrl = `${window.location.origin}/api/shorturl/${data.short_url}`;
            resultDiv.innerHTML = `
                <div class="success">
                    <p>Original URL: <a href="${data.original_url}" target="_blank">${data.original_url}</a></p>
                    <p>Short URL: <a href="${shortUrl}" target="_blank">${shortUrl}</a></p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error:', error);
        resultDiv.innerHTML = `
            <div class="error">
                An error occurred. Please try again.
            </div>
        `;
    }

    urlInput.value = '';
});