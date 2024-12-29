
## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/urlshortener.git
    cd urlshortener
    ```

2. Install dependencies:
    ```sh
    npm install
    ```

3. Create a [.env](http://_vscodecontentref_/6) file in the root directory and add your MongoDB URI and port:
    ```env
    MONGODB_URI=your_mongodb_uri
    PORT=3000
    ```

4. Start the server:
    ```sh
    npm start
    ```

## Usage

1. Open your browser and navigate to `http://localhost:3000`.
2. Enter a URL in the input field and click "Shorten URL".
3. The shortened URL will be displayed, and you can use it to redirect to the original URL.

## API Endpoints

- **POST** `/api/shorturl` - Create a short URL
- **GET** `/api/shorturl/:short_url` - Redirect to the original URL

## Deployment

This project is configured to be deployed on Vercel. The configuration is defined in the [vercel.json](http://_vscodecontentref_/7) file.

## License

This project is licensed under the MIT License.