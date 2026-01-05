<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bagares Optical Management System</title>
    <link rel="icon" type="image/png" href="../kent/assets/picture/logo.jpg"/>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f7fa; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
        .container { background: #fff; padding: 25px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); width: 400px; text-align: center; }
        .logo img { width: 60px; margin-bottom: 20px; border-radius: 50%; }
        h2 { color: #1a1a1a; font-size: 1.5em; margin-bottom: 5px; }
        p { color: #666; font-size: 0.9em; margin-bottom: 25px; }
        .form-group { margin-bottom: 20px; text-align: left; }
        .form-group label { display: block; color: #333; font-size: 0.9em; margin-bottom: 8px; }
        .form-group input { width: 100%; padding: 12px 15px; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 0.95em; transition: border-color 0.3s ease; }
        .form-group input:focus { border-color: #007bff; outline: none; }
        .options { display: flex; justify-content: space-between; font-size: 0.85em; color: #666; margin-bottom: 20px; }
        .options a { color: #007bff; text-decoration: none; }
        button { width: 100%; padding: 12px; background-color: #007bff; color: #fff; border: none; border-radius: 8px; font-size: 1em; cursor: pointer; transition: background-color 0.3s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.5); }
        button:hover { background-color: #0056b3; }
        .signup-link, .login-link { margin-top: 15px; font-size: 0.85em; color: #666; }
        .signup-link a, .login-link a { color: #007bff; text-decoration: none; }
        .signup-form, .login-form { display: none; }
        .signup-form.active, .login-form.active { display: block; }
        .terms { text-align: left; font-size: 0.85em; color: #666; margin-bottom: 20px; }
        .terms input { margin-right: 8px; }
    </style>

    
    
</head>
<body>
    <div class="container">
        <div class="logo">
            <img src="../kent/assets/picture/logo.jpg" alt="Logo">
        </div>
        <h2>Bagares Optical Clinic</h2>
        <p>Management System</p>

        <!-- LOGIN FORM -->
        <div class="login-form active">
            <div class="form-group">
                <label for="login-username">Username</label>
                <input type="text" id="login-username" placeholder="Enter your username">
            </div>
            <div class="form-group">
                <label for="login-password">Password</label>
                <input type="password" id="login-password" placeholder="Enter your password">
            </div>
            <div class="options">
                <label><input type="checkbox"> Remember me</label>
                <a href="#">Forgot password?</a>
            </div>
            <button onclick="login()">Log in</button>
            <div class="signup-link">
                <p>Don't have an account? <a href="#" onclick="showSignup()">Sign Up</a></p>
            </div>
        </div>

        <!-- SIGNUP FORM -->
        <div class="signup-form">
            <div class="form-group">
                <label for="first-name">First Name</label>
                <input type="text" id="first-name" placeholder="Enter first name">
            </div>
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" placeholder="Enter email">
            </div>
            <div class="form-group">
                <label for="signup-username">Username</label>
                <input type="text" id="signup-username" placeholder="Enter username">
            </div>
            <div class="form-group">
                <label for="signup-password">Password</label>
                <input type="password" id="signup-password" placeholder="Enter your password">
            </div>
            <div class="form-group">
                <label for="confirm-password">Confirm Password</label>
                <input type="password" id="confirm-password" placeholder="Confirm your password">
            </div>
            <div class="terms">
                <label><input type="checkbox" id="terms"> I accept the terms of service and privacy policy</label>
            </div>
            <button onclick="signup()">Create Account</button>
            <div class="login-link">
                <p>Already registered? <a href="#" onclick="showLogin()">Sign In</a></p>
            </div>
        </div>
    </div>

    <script>
        // Show signup
        function showSignup() {
            document.querySelector('.login-form').classList.remove('active');
            document.querySelector('.signup-form').classList.add('active');
        }
        // Show login
        function showLogin() {
            document.querySelector('.signup-form').classList.remove('active');
            document.querySelector('.login-form').classList.add('active');
        }

        // LOGIN FUNCTION
        function login() {
            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;

            if (!username || !password) {
                alert("Please enter both username and password.");
                return;
            }

            fetch('process_login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
            })
            .then(res => res.text())
            .then(data => {
                data = data.trim();
                if (data === 'invalid') {
                    alert('Invalid login. But account will be created automatically for testing.');
                    // automatically create account for testing
                    fetch('db.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: `username=${encodeURIComponent(username)}&email=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
                    })
                    .then(r => r.text())
                    .then(d => alert('Account created in DB. You can login now.'))
                } else {
                    alert('Login successful! Role: ' + data);
                }
            })
            .catch(err => console.error(err));
        }
        

        // SIGNUP FUNCTION
        function signup() {
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const terms = document.getElementById('terms').checked;

    if (!username || !email || !password || !confirmPassword) {
        alert("Please fill in all fields.");
        return;
    }
    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }
    if (!terms) {
        alert("You must accept the terms.");
        return;
    }

    fetch('db.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `username=${encodeURIComponent(username)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
    })
    .then(res => res.text())
    .then(data => {
        data = data.trim();
        if (data === 'success') {
            alert('Account created successfully! You can now login.');
            showLogin();
        } else {
            alert('Error creating account: ' + data);
        }
    })
    .catch(err => console.error(err));
}

    </script>
</body>
</html>
