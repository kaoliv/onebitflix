import { Response } from 'express'
import fs from 'fs'
import path from 'path'

export const episodeService = {
  streamEpisodeToResponse: (res: Response, videoUrl: string, range: string | undefined) => {
    const filePath = path.join(__dirname, '../../uploads', videoUrl)
    const fileStat = fs.statSync(filePath)

    if (range) { //se o range existir, será carregado o trecho específicado do video
      const parts = range.replace(/bytes=/, '').split('-') //exemplo: bytes=1000-3000

      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : fileStat.size - 1

      const chunkSize = (end - start) + 1
      const file = fs.createReadStream(filePath, { start, end })

      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileStat.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4',
      }

      res.writeHead(206, head)
      file.pipe(res)

    } else { // se o range não for enviado, será carregado o video inteiro
      const head = {
        'Content-Length': fileStat.size,
        'Content-Type': 'video/mp4',
      }

      res.writeHead(200, head)
      fs.createReadStream(filePath).pipe(res)
    }
  }
}