import { Plugin } from "@opencode/plugin"
import { promises as fs } from 'fs'
import { join } from 'path'

interface Reminder {
  id: string
  message: string
  createdAt: number
}

const MEMOS_FILE = join(process.cwd(), 'memos.jsonl')

export default Plugin.define({
  id: "opencode-reminders",
  async setup(ctx) {
    // Ensure memos file exists
    try {
      await fs.access(MEMOS_FILE)
    } catch {
      await fs.writeFile(MEMOS_FILE, '', 'utf-8')
    }

    // Register the add-reminder tool (which returns full list for context)
    await ctx.tool.transform((editor) => {
      editor.add({
        name: "add-reminder",
        description: "Add a reminder message. Returns the full list of all reminders for context.",
        input: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "The reminder message to add"
            }
          },
          required: ["message"],
          additionalProperties: false
        },
        options: {
          codemode: true
        },
        execute: async (input, context) => {
          const { message } = input as { message: string }
          const reminder: Reminder = {
            id: `reminder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            message,
            createdAt: Date.now()
          }

          // Write to JSONL file
          await fs.appendFile(MEMOS_FILE, JSON.stringify(reminder) + '\n', 'utf-8')

          // Read back and return all reminders for context
          const content = await fs.readFile(MEMOS_FILE, 'utf-8')
          const allReminders: Reminder[] = content.trim().split('\n')
            .filter((line: string) => line.trim())
            .map((line: string) => JSON.parse(line))

          const reminderList = allReminders
            .map(r => `- ${r.message} (added: ${new Date(r.createdAt).toLocaleString()})`)
            .join('\n')

          return {
            content: `📋 **Reminders:**\n\n${reminderList}\n\nReminder added: "${message}"`
          }
        }
      })
    })

    // Register a hook that includes reminders in context before completion
    const registration = await ctx.session.hook("context", (event) => {
      // Retrieve reminders to include in system context
      const getReminders = async (): Promise<string> => {
        try {
          const content = await fs.readFile(MEMOS_FILE, 'utf-8')
          const allReminders: Reminder[] = content.trim().split('\n')
            .filter((line: string) => line.trim())
            .map((line: string) => JSON.parse(line))

          if (allReminders.length === 0) {
            return ''
          }

          const reminderRefs = allReminders.map(r => `Reminder: ${r.message}`).join('; ')
          return `Remember to address these reminders: ${reminderRefs}`
        } catch {
          return ''
        }
      }

      // Add reminders to system context
      getReminders().then(reminderRefs => {
        if (reminderRefs) {
          event.system.push({
            type: "text",
            text: reminderRefs
          })
        }
      })
    })

    return () => registration.dispose()
  },
})