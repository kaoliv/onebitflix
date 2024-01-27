import { Course } from "../models"

export const courseService = {
  findByIdWithEpisodes:async (id:string) => {
    const coursesWithEpisodes = await Course.findByPk(id, {
      attributes: [
        'id',
        'name',
        'synopsis',
        ['thumbnail_url', 'thumbnailUrl']
      ],
      include: {
        association: 'episodes',
        attributes: [
          'id',
          'name',
          'order',
          'synopsis',
          ['video_url', 'videoUrl'],
          ['seconds_long', 'secondsLong']
        ],
        order: [['order', 'ASC']],
        separate: true
      }
    })
    return coursesWithEpisodes
  },

  getRandomFeaturedCourses:async () => {
    const featuredCourses = await Course.findAll({
      attributes: [
        'id', 
        'name',
        'synopsis', 
        ['thumbnail_url', 'thumbnailUrl']
      ],
      where: {
        featured: true
      }
    })

    const randomFeaturedCourses = featuredCourses.sort(() => 0.5 - Math.random())
    return randomFeaturedCourses.slice(0, 3)
  }
}