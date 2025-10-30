/*
    This is our http api for all things auth, which we use to 
    send authorization requests to our back-end API. Using Fetch API
    for making HTTP requests.
    
    @author McKilla Gorilla
*/

const baseURL = "http://localhost:4000/auth"

export const getLoggedIn = async () => {
    try {
        const res = await fetch(baseURL + "/loggedIn", {
            method: "GET",
            credentials: "include"
        });
        
        let data;
        const text = await res.text();
        try {
            data = text ? JSON.parse(text) : {};
        } catch (e) {
            data = { errorMessage: text || 'Request failed' };
        }
        
        return {
            status: res.status,
            statusText: res.statusText,
            data: data,
            headers: res.headers
        };
    } catch (error) {
        console.error('getLoggedIn error:', error);
        return {
            status: 500,
            data: { errorMessage: error.message }
        };
    }
}

export const loginUser = async (email, password) => {
    try {
        const res = await fetch(baseURL + "/login/", {
            method: "POST",
            credentials: "include",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        // Try to parse response as JSON
        let data;
        const text = await res.text();
        try {
            data = text ? JSON.parse(text) : {};
        } catch (e) {
            // If not JSON, use the text as error message
            data = { errorMessage: text || 'Login failed' };
        }
        
        return {
            status: res.status,
            statusText: res.statusText,
            data: data,
            headers: res.headers
        };
    } catch (error) {
        console.error('loginUser error:', error);
        return {
            status: 500,
            data: { errorMessage: error.message }
        };
    }
}

export const logoutUser = async () => {
    try {
        const res = await fetch(baseURL + "/logout/", {
            method: "GET",
            credentials: "include"
        });
        
        const data = await res.text(); // logout might return empty response
        
        return {
            status: res.status,
            statusText: res.statusText,
            data: data ? JSON.parse(data) : {},
            headers: res.headers
        };
    } catch (error) {
        console.error('logoutUser error:', error);
        return {
            status: 500,
            data: { errorMessage: error.message }
        };
    }
}

export const registerUser = async (firstName, lastName, email, password, passwordVerify) => {
    try {
        const res = await fetch(baseURL + "/register/", {
            method: "POST",
            credentials: "include",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: password,
                passwordVerify: passwordVerify
            })
        });

        let data;
        const text = await res.text();
        try {
            data = text ? JSON.parse(text) : {};
        } catch (e) {
            data = { errorMessage: text || 'Registration failed' };
        }
        
        return {
            status: res.status,
            statusText: res.statusText,
            data: data,
            headers: res.headers
        };
    } catch (error) {
        console.error('registerUser error:', error);
        return {
            status: 500,
            data: { errorMessage: error.message }
        };
    }
}

const apis = {
    getLoggedIn,
    registerUser,
    loginUser,
    logoutUser
}

export default apis