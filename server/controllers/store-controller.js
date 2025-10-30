const { getDatabaseManager } = require('../db')
const auth = require('../auth')

// Get database manager instance
const db = getDatabaseManager();

/*
    This is our back-end API. It provides all the data services
    our database needs. Note that this file contains the controller
    functions for each endpoint.
    
    @author McKilla Gorilla
*/

createPlaylist = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    const body = req.body;
    console.log("createPlaylist body: " + JSON.stringify(body));
    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a Playlist',
        })
    }
    
    try {
        const user = await db.findUserById(req.userId);
        console.log("user found: " + JSON.stringify(user));
        
        const playlist = await db.createPlaylist(body);
        console.log("playlist created: " + playlist.toString());
        
        // Note: If your User model has a playlists array, you'll need to add
        // a method to DatabaseManager to update user's playlist array
        // For now, the playlist is created with ownerEmail which links them
        
        return res.status(201).json({
            playlist: playlist
        })
    } catch (error) {
        return res.status(400).json({
            errorMessage: 'Playlist Not Created!',
            error: error.message
        })
    }
}

deletePlaylist = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    console.log("delete Playlist with id: " + JSON.stringify(req.params.id));
    
    try {
        const playlist = await db.findPlaylistById(req.params.id);
        console.log("playlist found: " + JSON.stringify(playlist));
        
        if (!playlist) {
            return res.status(404).json({
                errorMessage: 'Playlist not found!',
            })
        }

        // DOES THIS LIST BELONG TO THIS USER?
        const user = await db.findUserByEmail(playlist.ownerEmail);
        console.log("user._id: " + (user._id || user.id));
        console.log("req.userId: " + req.userId);
        
        if ((user._id || user.id) == req.userId) {
            console.log("correct user!");
            await db.deletePlaylist(req.params.id);
            return res.status(200).json({});
        }
        else {
            console.log("incorrect user!");
            return res.status(400).json({ 
                errorMessage: "authentication error" 
            });
        }
    } catch (err) {
        console.log(err);
        return res.status(400).json({
            errorMessage: 'Error deleting playlist',
            error: err.message
        })
    }
}

getPlaylistById = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    console.log("Find Playlist with id: " + JSON.stringify(req.params.id));

    try {
        const list = await db.findPlaylistById(req.params.id);
        
        if (!list) {
            return res.status(400).json({ success: false, error: 'Playlist not found' });
        }
        
        console.log("Found list: " + JSON.stringify(list));

        // DOES THIS LIST BELONG TO THIS USER?
        const user = await db.findUserByEmail(list.ownerEmail);
        console.log("user._id: " + (user._id || user.id));
        console.log("req.userId: " + req.userId);
        
        if ((user._id || user.id) == req.userId) {
            console.log("correct user!");
            return res.status(200).json({ success: true, playlist: list })
        }
        else {
            console.log("incorrect user!");
            return res.status(400).json({ success: false, description: "authentication error" });
        }
    } catch (err) {
        console.log(err);
        return res.status(400).json({ success: false, error: err.message });
    }
}

getPlaylistPairs = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    console.log("getPlaylistPairs");
    
    try {
        const user = await db.findUserById(req.userId);
        console.log("find user with id " + req.userId);
        console.log("find all Playlists owned by " + user.email);
        
        const pairs = await db.getPlaylistPairsByOwner(user.email);
        console.log("found Playlists: " + JSON.stringify(pairs));
        
        if (!pairs || pairs.length === 0) {
            console.log("!pairs.length");
            return res
                .status(404)
                .json({ success: false, error: 'Playlists not found' })
        }
        
        console.log("Send the Playlist pairs");
        return res.status(200).json({ success: true, idNamePairs: pairs })
    } catch (err) {
        console.log(err);
        return res.status(400).json({ success: false, error: err.message })
    }
}

getPlaylists = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    
    try {
        // Note: This gets ALL playlists - you might want to add a method
        // to DatabaseManager for this if needed
        const user = await db.findUserById(req.userId);
        const playlists = await db.getPlaylistPairsByOwner(user.email);
        
        if (!playlists.length) {
            return res
                .status(404)
                .json({ success: false, error: `Playlists not found` })
        }
        return res.status(200).json({ success: true, data: playlists })
    } catch (err) {
        console.log(err);
        return res.status(400).json({ success: false, error: err.message })
    }
}

updatePlaylist = async (req, res) => {
    if(auth.verifyUser(req) === null){
        return res.status(400).json({
            errorMessage: 'UNAUTHORIZED'
        })
    }
    const body = req.body
    console.log("updatePlaylist: " + JSON.stringify(body));
    console.log("req.body.name: " + req.body.name);

    if (!body) {
        return res.status(400).json({
            success: false,
            error: 'You must provide a body to update',
        })
    }

    try {
        const playlist = await db.findPlaylistById(req.params.id);
        console.log("playlist found: " + JSON.stringify(playlist));
        
        if (!playlist) {
            return res.status(404).json({
                message: 'Playlist not found!',
            })
        }

        // DOES THIS LIST BELONG TO THIS USER?
        const user = await db.findUserByEmail(playlist.ownerEmail);
        console.log("user._id: " + (user._id || user.id));
        console.log("req.userId: " + req.userId);
        
        if ((user._id || user.id) == req.userId) {
            console.log("correct user!");
            console.log("req.body.name: " + req.body.name);

            const updateData = {
                name: body.playlist.name,
                songs: body.playlist.songs
            };
            
            const updatedPlaylist = await db.updatePlaylist(req.params.id, updateData);
            console.log("SUCCESS!!!");
            return res.status(200).json({
                success: true,
                id: updatedPlaylist._id || updatedPlaylist.id,
                message: 'Playlist updated!',
            })
        }
        else {
            console.log("incorrect user!");
            return res.status(400).json({ success: false, description: "authentication error" });
        }
    } catch (error) {
        console.log("FAILURE: " + JSON.stringify(error));
        return res.status(404).json({
            error: error.message,
            message: 'Playlist not updated!',
        })
    }
}

module.exports = {
    createPlaylist,
    deletePlaylist,
    getPlaylistById,
    getPlaylistPairs,
    getPlaylists,
    updatePlaylist
}