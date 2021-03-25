const config = require('../../config');
const { CloudTasksClient } = require('@google-cloud/tasks')
const project = JSON.parse(process.env.FIREBASE_CONFIG).projectId
const queue = 'scheduled'

module.exports = {
    schedule: {
        byTimestamp: async (functionName, payload, timestamp) => {
            const tasksClient = new CloudTasksClient()
            const queuePath = tasksClient.queuePath(project, config.gcloud.location, queue)
            const url = `https://${config.gcloud.location}-${project}.cloudfunctions.net/${functionName}`
            const task = {
                httpRequest: {
                    httpMethod: 'POST',
                    url,
                    body: Buffer.from(JSON.stringify(payload)).toString('base64'),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
                scheduleTime: {
                    seconds: timestamp
                }
            }
            const [ response ] = await tasksClient.createTask({ parent: queuePath, task })
            return response.name;
        }
    }
}
