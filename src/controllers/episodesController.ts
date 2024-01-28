import { Request, Response } from 'express'
import { episodeService } from '../services/episodeService';

export const episodesController = {
  // GET /episodes/stream
  stream: async (req: Request, res: Response) => {
    const { videoUrl } = req.body

		try {
			if (typeof videoUrl !== 'string') throw new Error('videoUrl deve ser do tipo \'string\'');
      const range = req.headers.range
      
      episodeService.streamEpisodeToResponse(res, videoUrl, range)
    } 
     catch (err) {
      if (err instanceof Error) return res.status(400).json({ message: err.message })
    }
  }
}