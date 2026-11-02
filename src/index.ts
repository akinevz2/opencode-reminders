import { Plugin } from "@opencode/plugin"
import { promises as fs } from 'fs'
import { join } from 'path'

interface Reminder {
  id: string
  message: string
  createdAt: number
  files?: string[]
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

    // Register the add-reminder tool (returns full list filtered by files if requested)
    await ctx.tool.transform((editor) => {
      editor.add({
        name: "add-reminder",
        description: "Add a reminder message. Returns ALL reminders or filtered by affected files. Add files parameter for file-specific reminders.",
        input: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "The reminder message to add"
            },
            files: {
              type: "array",
              description: "Optional list of affected files (paths relative to project root). If provided, reminder will be tagged with these files.",
              items: {
                type: "string"
              }
            }
          },
          required: ["message"],
          additionalProperties: false
        },
        options: {
          codemode: true
        },
        execute: async (input, context) => {
          const { message, files } = input as { message: string; files?: string[] }

          const reminder: Reminder = {
            id: `reminder-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            message,
            createdAt: Date.now(),
            files: files || undefined
          }

          // Write to JSONL file
          await fs.appendFile(MEMOS_FILE, JSON.stringify(reminder) + '\n', 'utf-8')

          // Read back and return all reminders (optionally filtered)
          const content = await fs.readFile(MEMOS_FILE, 'utf-8')
          const allReminders: Reminder[] = content.trim()
            .split('\n')
            .filter((line: string) => line.trim())
            .map((line: string) => JSON.parse(line))

          // Filter reminders if files parameter was provided
          const remindersToShow = files && files.length > 0
            ? allReminders.filter(r => {
                // Reminder matches if it has files and at least one matches
                const hasMatchingFiles = r.files && r.files.some(file => files.some(affected => affected.toLowerCase().includes(file.toLowerCase()) || file.toLowerCase().includes(affected.toLowerCase())));
                return hasMatchingFiles;
              })
            : allReminders

          const reminderList = remindersToShow
            .map(r => `- ${r.message} ${r.files ? `(${r.files.join(', ')})` : ''} (added: ${new Date(r.createdAt).toLocaleString()})`)
            .join('\n')

          const summary = files && files.length > 0
            ? `📋 **Reminders for affected files:**\n\n${reminderList}`
            : `📋 **All reminders:**\n\n${reminderList}`

          return {
            content: `${summary}\n\nReminder added: "${message}" ${files ? `to files: ${files.join(', ')}` : ''}`
          }
        }
      })
    })

    // Register a hook that includes file-specific reminders in context
    const registration = await ctx.session.hook("context", (event) => {
      // Retrieve reminders to include in system context
      const getReminders = async (files?: string[]): Promise<string> => {
        try {
          const content = await fs.readFile(MEMOS_FILE, 'utf-8')
          const allReminders: Reminder[] = content.trim()
            .split('\n')
            .filter((line: string) => line.trim())
            .map((line: string) => JSON.parse(line))

          if (allReminders.length === 0) {
            return ''
          }

          // Get context based on files parameter
          const remindersToShow = files && files.length > 0
            ? allReminders.filter(r => {
                const hasMatchingFiles = r.files && r.files.some(file => files.some(affected => affected.toLowerCase().includes(file.toLowerCase()) || file.toLowerCase().includes(affected.toLowerCase())));
                return hasMatchingFiles;
              })
            : allReminders

          if (remindersToShow.length === 0) {
            return ''
          }

          const reminderRefs = remindersToShow.map(r => {
            const fileInfo = r.files && r.files.length > 0 ? ` [${r.files.join(', ')}]` : ''
            return `Reminder${fileInfo}: ${r.message}`
          }).join('; ')

          return `Remember to address these${files && files.length > 0 ? ' file-specific' : ''} reminders: ${reminderRefs}`
        } catch {
          return ''
        }
      }

      // Add reminders to system context (non-blocking, without files first)
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