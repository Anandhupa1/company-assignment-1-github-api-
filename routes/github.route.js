const githubRoute = require("express").Router();
const { MongoClient } = require("mongodb");
const fetch = require('node-fetch');
require("dotenv").config();
const uri = "mongodb://localhost:27017/github";
const client = new MongoClient(uri, { family: 4 });
// Connecting to MongoDB once during app initialization
client.connect(err => {
    if (err) {
        console.error("MongoDB connection error:", err);
        process.exit();
    }
    console.log("Connected to MongoDB");
});

githubRoute.post('/', async (req, res) => {
    try {
        const url = req.body.url;
        const response = await fetch(url);
        const data = await response.json();
        console.log(data)
        const database = client.db('githubRepoAPI');
        const repos = database.collection('repos');
        
        for (const repo of data) {
            const {
                id, name, html_url, description, created_at,
                open_issues, watchers, owner,
            } = repo;
            
            const formattedData = {
                id, name, html_url, description, created_at,
                open_issues, watchers,
                owner: {
                    id: owner.id,
                    avatar_url: owner.avatar_url,
                    html_url: owner.html_url,
                    type: owner.type,
                    site_admin: owner.site_admin,
                },
            };

            await repos.updateOne({ id: formattedData.id }, { $set: formattedData }, { upsert: true });
        }

        res.status(200).json({ message: 'Data saved successfully!' });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
        console.log(error);
    }
});

githubRoute.get('/:id', async (req, res) => {
    try {
        const repoId = parseInt(req.params.id);
        const database = client.db('githubRepoAPI');
        const repos = database.collection('repos');
        const repoData = await repos.findOne({ id: repoId });

        if (!repoData) {
            return res.status(404).json({ error: 'Repo not found' });
        }

        res.status(200).json(repoData);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
        console.log(error);
    }
});

module.exports = { githubRoute };
