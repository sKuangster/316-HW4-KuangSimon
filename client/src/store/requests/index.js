/*
    This is our http api, which we use to send requests to
    our back-end API. Note we`re using the Axios library
    for doing this, which is an easy to use AJAX-based
    library. We could (and maybe should) use Fetch, which
    is a native (to browsers) standard, but Axios is easier
    to use when sending JSON back and forth and it`s a Promise-
    based API which helps a lot with asynchronous communication.
    
    @author McKilla Gorilla
*/
const baseURL = "http://localhost:4000/store";

// THESE ARE ALL THE REQUESTS WE`LL BE MAKING, ALL REQUESTS HAVE A
// REQUEST METHOD (like get) AND PATH (like /top5list). SOME ALSO
// REQUIRE AN id SO THAT THE SERVER KNOWS ON WHICH LIST TO DO ITS
// WORK, AND SOME REQUIRE DATA, WHICH WE WE WILL FORMAT HERE, FOR WHEN
// WE NEED TO PUT THINGS INTO THE DATABASE OR IF WE HAVE SOME
// CUSTOM FILTERS FOR QUERIES
export const createPlaylist = async (newListName, newSongs, userEmail) => {

    const res = await fetch(baseURL + "/playlist/", {
        method:"POST",
        credentials:"include",
        headers:{
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: newListName,
            songs: newSongs,
            ownerEmail: userEmail,
        }),
    });

    if(!res.ok)
        throw new Error("Couldn't create playlist, status: " + res.status)
    const data = await res.json();

    return {
        status: res.status,
        statusText: res.statusText,
        data: data,
        headers: res.headers
    };
}

export const deletePlaylistById = async (id) => {
    // api.delete(`/playlist/${id}`)

    const res = await fetch(baseURL + `/playlist/${id}`, {
        method:"DELETE",
        credentials:"include",
    });
    if(!res.ok)
        throw new Error(`Could not delete playlist with ${id} with status code: ${res.status}`)
    
    const data = await res.json();
    return {
        status: res.status,
        statusText: res.statusText,
        data: data,
        headers: res.headers
    }
}
export const getPlaylistById = async (id) => {
    // api.get(`/playlist/${id}`)
    const res = await fetch(baseURL + `/playlist/${id}`, {
        method:"GET",
        credentials:"include",
    });

    if(!res.ok)
        throw new Error("Could not get Playlist by id, status: " + res.status)
    const data = await res.json();
    return {
        status: res.status,
        statusText: res.statusText,
        data: data,
        headers: res.headers,
    }
}

export const getPlaylistPairs = async () => {
    // api.get(`/playlistpairs/`)
    const res = await fetch(baseURL + `/playlistpairs/`, {
        method:"GET",
        credentials:"include",
    });

    if(!res.ok)
        throw new Error("Couldn't retrieve playlist pairs, status: " + res.status)

    const data = await res.json()
    return {
        status: res.status,
        statusText: res.statusText,
        data: data,
        headers: res.headers,
    }
}
export const updatePlaylistById = async (id, playlist) => {
    console.log(playlist);
    const res = await fetch(baseURL + `/playlist/${id}`, 
        {
            method:"PUT",
            credentials:"include",
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                playlist: playlist,
            })
        })

    if(!res.ok)
        throw new Error("Could not update playlist, status code: " + res.status)

    const data = await res.json();
    return {
        status: res.status,
        statusText: res.statusText,
        data: data,
        headers: res.headers,
    }
}

const apis = {
    createPlaylist,
    deletePlaylistById,
    getPlaylistById,
    getPlaylistPairs,
    updatePlaylistById
}

export default apis
