import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../supabase-client'
import type { Task } from '../types/task'
import '../styles/TaskDetail.css'

function TaskDetail() {
  const { id } = useParams()
  const [task, setTask] = useState<Task | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchTask = async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single()

      if (!error) {
        setTask(data)
      }
    }

    fetchTask()
  }, [id])

  if (!task) return <p>Loading...</p>

  return (
    <div className="task-detail-container">
      <button className="back-button" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <div className="task-detail-content">
        <div className="task-image-section">
          {task.image_url && (
            <img src={task.image_url} alt="task" className="task-image" />
          )}
          <div className="task-buttons">
            <button className="edit-button">Edit</button>
            <button className="delete-button">Delete</button>
          </div>
        </div>

        <div className="task-info-section">
          <h2>{task.title}</h2>
          <p>{task.description}</p>
        </div>
      </div>
    </div>
  )
}

export default TaskDetail
