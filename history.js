    document.addEventListener('DOMContentLoaded', () => {

    // IMPORTANT: Replace this with the public URL of your Hugging Face backend
    const BACKEND_URL = 'https://yashgoyal06-backend.hf.space';

    const fetchBtn = document.getElementById('fetch-history-btn');
    const emailInput = document.getElementById('email-input');
    const resultsContainer = document.getElementById('history-results');
    const loader = document.getElementById('loader');
    const reportModal = new bootstrap.Modal(document.getElementById('reportModal'));
    
    let currentScans = [];

    fetchBtn.addEventListener('click', fetchHistory);
    emailInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') fetchHistory();
    });

    async function fetchHistory() {
        const email = emailInput.value.trim();
        if (!email) {
            alert('Please enter a valid email address.');
            return;
        }

        loader.classList.remove('d-none');
        resultsContainer.innerHTML = '';
        currentScans = [];

        try {
            const response = await fetch(`${BACKEND_URL}/api/history?email=${encodeURIComponent(email)}`);
            if (!response.ok) throw new Error('Network response was not ok.');
            
            const scans = await response.json();
            currentScans = scans;
            displayHistory(scans);
        } catch (error) {
            console.error('Fetch error:', error);
            resultsContainer.innerHTML = `<p class="text-center text-danger">Failed to fetch history. Please check the backend URL and try again.</p>`;
        } finally {
            loader.classList.add('d-none');
        }
    }

    function displayHistory(scans) {
        if (scans.length === 0) {
            resultsContainer.innerHTML = `<p class="text-center text-muted fs-5 mt-4">No history found for this email.</p>`;
            return;
        }

        scans.forEach((scan, index) => {
            const card = `
                <div class="col-md-6 col-lg-4 mb-4">
                    <div class="card shadow-sm h-100">
                        <img src="${scan.image_url}" class="card-img-top" alt="Scan Image" style="height: 200px; object-fit: cover;">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${scan.prediction}</h5>
                            <p class="card-text">
                                <span class="badge bg-light text-dark">${scan.patient_name || 'N/A'}</span>
                                <span class="badge bg-light text-dark">${scan.timestamp}</span>
                            </p>
                            <div class="mt-auto pt-2">
                                <button class="btn btn-outline-primary w-100 mb-2" data-index="${index}" data-action="view">View Details</button>
                                <a href="${BACKEND_URL}/download-report/${scan.id}" class="btn btn-outline-secondary w-100" target="_blank">Download PDF</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            resultsContainer.innerHTML += card;
        });
    }
    
    resultsContainer.addEventListener('click', (e) => {
        if (e.target && e.target.dataset.action === 'view') {
            const scanIndex = e.target.dataset.index;
            const scan = currentScans[scanIndex];
            populateAndShowModal(scan);
        }
    });

    function populateAndShowModal(scan) {
        document.getElementById('modal-image').src = scan.image_url;
        document.getElementById('modal-prediction').textContent = scan.prediction;
        document.getElementById('modal-patient-name').textContent = scan.patient_name || 'N/A';
        document.getElementById('modal-confidence').textContent = scan.confidence;
        document.getElementById('modal-timestamp').textContent = scan.timestamp;
        
        const emailBtn = document.getElementById('modal-email-btn');
        emailBtn.dataset.scanId = scan.id;
        emailBtn.disabled = false;
        document.getElementById('email-status').innerHTML = '';
        
        reportModal.show();
    }
    
    document.getElementById('modal-email-btn').addEventListener('click', async (e) => {
        const scanId = e.target.dataset.scanId;
        const emailStatus = document.getElementById('email-status');
        e.target.disabled = true;
        emailStatus.textContent = 'Sending...';

        try {
            const response = await fetch(`${BACKEND_URL}/api/email-report/${scanId}`);
            const result = await response.json();
            if (result.success) {
                emailStatus.innerHTML = `<span class="text-success">${result.message}</span>`;
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            emailStatus.innerHTML = `<span class="text-danger">Error: ${error.message || 'Could not send email.'}</span>`;
            e.target.disabled = false;
        }
    });
});