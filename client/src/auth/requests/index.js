/*
    This is our http api for all things auth, which we use to 
    send authorization requests to our back-end API. Note we`re 
    using the Axios library for doing this, which is an easy to 
    use AJAX-based library. We could (and maybe should) use Fetch, 
    which is a native (to browsers) standard, but Axios is easier
    to use when sending JSON back and forth and it`s a Promise-
    based API which helps a lot with asynchronous communication.
    
    @author McKilla Gorilla
*/
// import axios from 'axios'
// axios.defaults.withCredentials = true;
// const api = axios.create({
//     baseURL: baseURL,
// })

// THESE ARE ALL THE REQUESTS WE`LL BE MAKING, ALL REQUESTS HAVE A
// REQUEST METHOD (like get) AND PATH (like /register). SOME ALSO
// REQUIRE AN id SO THAT THE SERVER KNOWS ON WHICH LIST TO DO ITS
// WORK, AND SOME REQUIRE DATA, WHICH WE WE WILL FORMAT HERE, FOR WHEN
// WE NEED TO PUT THINGS INTO THE DATABASE OR IF WE HAVE SOME
// CUSTOM FILTERS FOR QUERIES

const baseURL = "http://localhost:4000/auth"

export const getLoggedIn = async () => {
    const res = await fetch(baseURL + "/loggedIn", {
        method: "GET",
        credentials: "include"
    });
    
    if(!res.ok)
        throw new Error("HTTP error, status: " + res.status)
    
    const data = await res.json();
    
    return {
        status: res.status,
        statusText: res.statusText,
        data: data,
        headers: res.headers
    };
}

export const loginUser = async (email, password) => {
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

    if(!res.ok)
        throw new Error("Couldn't login, status: " + res.status);

    const data = await res.json();
    
    return {
        status: res.status,
        statusText: res.statusText,
        data: data,
        headers: res.headers
    };
}

export const logoutUser = async () => {
    const res = await fetch(baseURL + "/logout/", {
        method: "GET",
        credentials: "include"
    });
    
    if(!res.ok)
        throw new Error("Could not logout user, status: " + res.status);
    
    const data = await res.json();
    
    return {
        status: res.status,
        statusText: res.statusText,
        data: data,
        headers: res.headers
    };
}

export const registerUser = async (firstName, lastName, email, password, passwordVerify) => {
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

    if(!res.ok)
        throw new Error("Could not register user, status: " + res.status);

    const data = await res.json();
    
    return {
        status: res.status,
        statusText: res.statusText,
        data: data,
        headers: res.headers
    };
}

const apis = {
    getLoggedIn,
    registerUser,
    loginUser,
    logoutUser
}

export default apis