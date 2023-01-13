import express from "express"
import cors from "cors"
import { MongoClient } from "mongodb"
import dotenv from "dotenv"
import dayjs from "dayjs"
dotenv.config()

const app = express()
app.use(express.json())
app.use(cors())
const PORT = 5000

const mongoClient = new MongoClient(process.env.DATABASE_URL)
let db

try {
    await mongoClient.connect()
    db = mongoClient.db()
} catch (err) {
    console.log('vish... algo deu errado')
}

app.post('/participants', async (req, res) => {
    const userName = req.body.name

    try {
        await db.collection("participants").insertOne({
            name: userName,
            lastStatus: Date.now()
        })
        await db.collection("messages").insertOne({
            from: userName,
            to: "Todos",
            text: "entra na sala...",
            type: "status",
            time: dayjs().format('HH:mm:ss')
        })
        return res.sendStatus(201)
    } catch (err) {
        return res.sendStatus(500).send(err.message)
    }
})

app.get('/participants', async (req, res) => {
    const users =  await db.collection("participants").find().toArray()
    try {
        return res.send(users)
    } catch {
        return res.sendStatus(500).send(err.message)
    }
})

app.get('/messages', async (req, res) => {
    const messagesList =  await db.collection("messages").find().toArray()
    try {
        return res.send(messagesList)
    } catch {
        return res.sendStatus(500).send(err.message)
    }
})



app.listen(PORT, () => console.log(`Este servidor roda na porta: ${PORT}`))


