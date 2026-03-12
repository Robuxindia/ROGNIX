let isLoginMode = true;

// Modal HTML'lerini ekle (Auth ve Yakında)
const modalHtml = `
<div id="auth-modal" style="display:none; position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:white; border:2px solid #0084c7; padding:25px; z-index:2000; border-radius:10px; box-shadow:0 0 30px rgba(0,0,0,0.5); font-family: 'Comic Sans MS', cursive; width: 300px;">
    <h2 id="modal-title" style="margin-top:0; color:#0084c7;">Giriş Yap</h2>
    <div id="auth-status" style="margin-bottom:10px; font-size:13px; min-height:18px; display:none; padding:8px; border-radius:4px;"></div>
    <input type="text" id="username-input" placeholder="Kullanıcı Adı" style="display:block; margin-bottom:12px; padding:8px; width:calc(100% - 18px); border:1px solid #ccc; border-radius:4px;"><br>
    <input type="password" id="password-input" placeholder="Şifre" style="display:block; margin-bottom:15px; padding:8px; width:calc(100% - 18px); border:1px solid #ccc; border-radius:4px;"><br>
    <button onclick="handleAuth()" id="auth-submit-btn" style="background: linear-gradient(to bottom, #86b92a 0%, #5e841f 100%); color:white; border:1px solid #4a6c17; padding:12px; width:100%; font-weight:bold; cursor:pointer; border-radius:6px; font-size:16px;">Gönder</button>
    <p id="modal-switch" onclick="switchAuthMode()" style="cursor:pointer; color:#0084c7; font-size:13px; margin-top:15px; text-decoration:underline; text-align:center;">Hesabın yok mu? Kayıt Ol</p>
    <button onclick="closeAuthModal()" style="margin-top:15px; background:#f5f5f5; border:1px solid #ddd; padding:8px; cursor:pointer; width:100%; border-radius:6px; color:#666;">Kapat</button>
</div>

<div id="soon-modal" style="display:none; position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); background:white; border:3px solid #0084c7; padding:30px; z-index:3000; border-radius:15px; box-shadow:0 0 40px rgba(0,0,0,0.6); font-family: 'Comic Sans MS', cursive; text-align:center; min-width:250px;">
    <button onclick="closeSoonModal()" style="position:absolute; top:10px; right:10px; background:none; border:none; font-size:24px; cursor:pointer; color:#999; font-weight:bold;">&times;</button>
    <h2 style="color:#0084c7; margin-top:0;">YAKINDA!</h2>
    <p style="font-size:16px; color:#555;">Bu özellik veya oyun şu an yapım aşamasında. <br>Takipte kal!</p>
    <button onclick="closeSoonModal()" class="play-button" style="width:auto; padding:10px 30px; margin-top:10px;">Tamam</button>
</div>
`;
document.body.insertAdjacentHTML('beforeend', modalHtml);

// Enter tuşu desteği
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.getElementById('auth-modal').style.display === 'block') {
        handleAuth();
    }
});

function showAuthModal() { document.getElementById('auth-modal').style.display = 'block'; resetStatus(); }
function closeAuthModal() { document.getElementById('auth-modal').style.display = 'none'; }
function showSoonModal() { document.getElementById('soon-modal').style.display = 'block'; }
function closeSoonModal() { document.getElementById('soon-modal').style.display = 'none'; }

function resetStatus() {
    const statusDiv = document.getElementById('auth-status');
    if(statusDiv) { statusDiv.style.display = 'none'; statusDiv.innerText = ''; }
}

function showStatus(message, isError = true) {
    const statusDiv = document.getElementById('auth-status');
    if(!statusDiv) return;
    statusDiv.innerText = message;
    statusDiv.style.display = 'block';
    statusDiv.style.backgroundColor = isError ? '#f2dede' : '#dff0d8';
    statusDiv.style.color = isError ? '#a94442' : '#3c763d';
}

function switchAuthMode() {
    isLoginMode = !isLoginMode;
    document.getElementById('modal-title').innerText = isLoginMode ? "Giriş Yap" : "Kayıt Ol";
    document.getElementById('modal-switch').innerText = isLoginMode ? "Hesabın yok mu? Kayıt Ol" : "Zaten hesabın var mı? Giriş Yap";
    resetStatus();
}

async function handleAuth() {
    const username = document.getElementById('username-input').value.trim();
    const password = document.getElementById('password-input').value;
    
    if (!username || !password) {
        showStatus("Lütfen tüm alanları doldurun!");
        return;
    }

    const endpoint = isLoginMode ? '/api/login' : '/api/register';
    showStatus("İşleniyor...", false);

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        if (data.success) {
            localStorage.setItem('user', JSON.stringify(data.user));
            location.reload();
        } else {
            showStatus(data.message || "Bir hata oluştu.");
        }
    } catch (err) {
        showStatus("Sunucuya bağlanılamadı!");
        console.error(err);
    }
}

function logout() { localStorage.removeItem('user'); location.href = 'index.html'; }

function checkPlay(placeId) {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (!user) {
        showAuthModal();
        showStatus("Oynamak için giriş yapmalısın!");
        return;
    }

    // Doğrudan HTML dosyasına git
    console.log("Başlatılıyor:", placeId);
    
    const btn = event.target;
    const oldText = btn.innerText;
    btn.innerText = "Başlatılıyor...";
    btn.disabled = true;
    
    setTimeout(() => {
        location.href = placeId;
    }, 1000);
}

function updateUI() {
    const userStr = localStorage.getItem('user');
    const authSection = document.getElementById('auth-section');
    if (!authSection) return;

    if (userStr) {
        const user = JSON.parse(userStr);
        const tix = user.tix || 0;
        const robux = user.robux || 0;

        authSection.innerHTML = `
            <div class="currency-display" style="display: flex; align-items: center; gap: 10px;">
                <div style="display: flex; align-items: center;">
                    <img src="2016_Ticket.webp" alt="Tix" class="currency-icon" style="height:20px; margin-right:4px;">
                    <span class="currency-value" style="color:white; font-weight:bold;">${tix}</span>
                </div>
                <div style="display: flex; align-items: center;">
                    <img src="robux_icon.png" alt="Robux" class="currency-icon" style="height:20px; margin-right:4px;">
                    <span class="currency-value robux-value" style="color:#00A300; font-weight:bold;">${robux}</span>
                </div>
                <div style="width:1px; height:20px; background:rgba(255,255,255,0.3); margin:0 5px;"></div>
                <a href="profile.html" class="header-username" style="color:white; font-weight:bold; text-decoration:none;">${user.username}</a>
                <button onclick="logout()" class="search-button" style="background: linear-gradient(to bottom, #d9534f 0%, #c9302c 100%); border-color: #ac2925; padding: 5px 10px; margin-left:10px;">Çıkış</button>
            </div>
        `;
        
        const nameDisplays = document.querySelectorAll('.user-info-block h2, #home-username');
        nameDisplays.forEach(el => el.innerText = user.username);
        
        // Arkadaş Listesini Güncelle (index.html ve profile.html için)
        loadFriends(user.username);
    }

    // Arama Çubuğunu İşlevsel Yap
    const searchBtn = document.querySelector('.search-button');
    const searchInput = document.querySelector('.search-input');
    if (searchBtn && searchInput) {
        searchBtn.onclick = () => performSearch(searchInput.value);
        searchInput.onkeypress = (e) => { if(e.key === 'Enter') performSearch(searchInput.value); };
    }
}

async function loadFriends(username) {
    const friendContainers = document.querySelectorAll('.friend-list');
    if (friendContainers.length === 0) return;

    try {
        const res = await fetch('/api/user/' + username);
        const data = await res.json();
        
        friendContainers.forEach(container => {
            container.innerHTML = '';
            if (!data.friends || data.friends.length === 0) {
                container.innerHTML = '<p style="color:#999; font-size:12px;">Henüz arkadaşın yok.</p>';
                return;
            }
            data.friends.forEach(f => {
                const statusColor = f.is_online ? '#00ff00' : '#999';
                const statusText = f.is_online ? 'Online' : 'Offline';
                container.innerHTML += `
                    <div class="friend-item" style="position:relative;">
                        <div style="position:absolute; top:0; right:5px; width:10px; height:10px; background:${statusColor}; border-radius:50%; border:1px solid white;" title="${statusText}"></div>
                        <img src="noob.png" class="friend-avatar" style="width:50px; border:1px solid #ccc;">
                        <span style="font-size:11px; font-weight:bold;">${f.username}</span>
                    </div>
                `;
            });
        });
    } catch(e) {}
}

async function performSearch(query) {
    if (!query) return;
    const content = document.getElementById('content');
    content.innerHTML = `<h2>"${query}" için Arama Sonuçları</h2><div id="search-results" class="game-grid">Aranıyor...</div>`;
    
    try {
        const res = await fetch('/api/search?q=' + query);
        const results = await res.json();
        const resDiv = document.getElementById('search-results');
        resDiv.innerHTML = '';
        
        if (results.length === 0) {
            resDiv.innerHTML = '<p>Kullanıcı bulunamadı.</p>';
            return;
        }
        
        results.forEach(u => {
            const status = u.is_online ? '<span style="color:green;">● Online</span>' : '<span style="color:#999;">● Offline</span>';
            resDiv.innerHTML += `
                <div class="game-item">
                    <img src="noob.png" class="game-icon">
                    <h4>${u.username}</h4>
                    <p style="font-size:11px;">${u.bio || ''}</p>
                    <p style="font-size:12px; font-weight:bold;">${status}</p>
                    <button class="play-button" onclick="location.href='profile.html?user=${u.username}'">Profili Gör</button>
                </div>
            `;
        });
    } catch(e) { console.error(e); }
}

window.addEventListener('load', updateUI);
