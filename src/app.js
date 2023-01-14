import express, { response } from "express"
import cors from "cors"
import { MongoClient } from "mongodb"
import dotenv from "dotenv"
import dayjs from "dayjs"
import { participantSchema, messageSchema } from "../schemas/schema.js"
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
    const userName = req.body

    const validation = participantSchema.validate(userName)
    if (validation.error) {
        return res.sendStatus(422)
    }

    const userExists = await db.collection("participants").findOne({ name: userName.name })
    if (userExists) return res.sendStatus(409)

    try {
        await db.collection("participants").insertOne({
            name: userName.name,
            lastStatus: Date.now()
        })

        await db.collection("messages").insertOne({
            from: userName.name,
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
    const users = await db.collection("participants").find().toArray()
    try {
        return res.send(users)
    } catch {
        return res.sendStatus(500).send(err.message)
    }
})

app.post('/messages', async (req, res) => {
    const userMessage = req.body

    const validation = messageSchema.validate(userMessage)
    if (validation.error) {
        return res.sendStatus(422)
    }

    const userName = req.headers.user

    const userExists = await db.collection("participants").findOne({ name: userName })
    if (!userExists) return res.sendStatus(422)

    try {
        await db.collection("messages").insertOne({
            from: userName, 
            ...userMessage, 
            time: dayjs().format('HH:mm:ss')
        })
        return res.sendStatus(201)
    } catch (err) {
        return res.sendStatus(500).send(err.message)
    }
})

app.get('/messages', async (req, res) => {
    const limit = req.query.limit
    const userName = req.headers.user

    const messagesList = await db.collection("messages").find({$or: [{to: "Todos"}, {to: userName}, {from: userName}]}).toArray()
    try {
        if (limit) {
            parseInt(limit)
            return res.send(messagesList.slice(-limit))
        }
        return res.send(messagesList)
    } catch(err) {
        return res.sendStatus(500).send(err.message)
    }
})



app.listen(PORT, () => console.log(`Este servidor roda na porta: ${PORT}`))



