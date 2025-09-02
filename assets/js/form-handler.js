document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('image');
    const fileUploadText = document.querySelector('.file-upload-text');
    const uploadMessage = document.getElementById('upload-message');
    const form = document.getElementById('patient-form');
    const submitBtn = document.getElementById('submit-btn');
    const resultSection = document.getElementById('result-section');
    const resultContent = document.getElementById('result-content');

    // Handle file input change
    fileInput.addEventListener('change', () => {
        if (fileInput.files && fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
            const maxSize = 20 * 1024 * 1024; // 20MB in bytes

            // Validate file type and size
            if (!validTypes.includes(file.type)) {
                alert('Please upload an image in JPG, JPEG, or PNG format.');
                fileInput.value = '';
                fileUploadText.textContent = 'Choose Image';
                uploadMessage.style.display = 'none';
                return;
            }

            if (file.size > maxSize) {
                alert('File size exceeds 20MB. Please upload a smaller image.');
                fileInput.value = '';
                fileUploadText.textContent = 'Choose Image';
                uploadMessage.style.display = 'none';
                return;
            }

            // Update file upload text with file name
            fileUploadText.textContent = file.name;

            // Show upload successful message
            uploadMessage.innerHTML = `
                <span class="message-text">Upload Successful: ${file.name}</span>
                <button class="close-btn" aria-label="Close message">×</button>
            `;
            uploadMessage.style.display = 'flex';
            uploadMessage.classList.add('show');

            // Add event listener to close button
            const closeBtn = uploadMessage.querySelector('.close-btn');
            closeBtn.addEventListener('click', () => {
                uploadMessage.style.display = 'none';
                uploadMessage.classList.remove('show');
            });
        } else {
            fileUploadText.textContent = 'Choose Image';
            uploadMessage.style.display = 'none';
            uploadMessage.classList.remove('show');
        }
    });

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent default form submission

        // Disable submit button and show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';
        resultSection.style.display = 'none';
        resultContent.innerHTML = '';

        try {
            const formData = new FormData(form);

            const response = await fetch('/predict', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            // Display result
            resultSection.style.display = 'block';
            if (data.error) {
                resultContent.innerHTML = `
                    <div class="result-error">
                        <p>${data.error}</p>
                    </div>
                `;
            } else if (data.prediction === 'Low confidence') {
                resultContent.innerHTML = `
                    <div class="result-warning">
                        <p><strong>Warning:</strong> ${data.message}</p>
                        <p><strong>Confidence:</strong> ${data.confidence}</p>
                    </div>
                `;
            } else {
                resultContent.innerHTML = `
                    <div class="result-success">
                        <p><strong>Prediction:</strong> ${data.prediction}</p>
                        <p><strong>Confidence:</strong> ${data.confidence}</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error:', error);
            resultSection.style.display = 'block';
            resultContent.innerHTML = `
                <div class="result-error">
                    <p>An error occurred while processing your request. Please try again.</p>
                </div>
            `;
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Details';
        }
    });
});