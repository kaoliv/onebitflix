import { where } from "sequelize"
import { User } from "../models"
import { EpisodeInstance } from "../models/Episode"
import { UserCreationAttributes } from "../models/User"

function filterLastEpisodesByCourse(episodes: EpisodeInstance[]) {
  const coursesOnList: number[] = []

  const lastEpisodes = episodes.reduce((currentList, episode) => {
    if (!coursesOnList.includes(episode.courseId)) {
      coursesOnList.push(episode.courseId)
      currentList.push(episode)
      return currentList
    }

    const episodeFromSameCourse = currentList.find(ep => ep.courseId === episode.courseId)

    if (episodeFromSameCourse!.order > episode.order) return currentList

    const listWithEpisodeFromDifferentCourse = currentList.filter(ep => ep.courseId !== episode.courseId)
    listWithEpisodeFromDifferentCourse.push(episode)

    return listWithEpisodeFromDifferentCourse
  }, [] as EpisodeInstance[])

  return lastEpisodes
}

export const userService = {
  findByEmail: async (email: string) => {
    const user = await User.findOne({
      where: {
        email
      }
    })
    return user
  },

  create:async (attributes:UserCreationAttributes) => {
    const user = await User.create(attributes)
    return user  
  },

  update:async (id:number, attributes: {
    firstName: string
    lastName: string
    phone: string
    birth: Date
    email: string
  }) => {
    //  affectedRows contém o numero de linhas afetadas // updatedUsers contém um array dos usuários afetados (no caso apenas 1)
    const [affectedRows, updatedUsers] = await User.update(attributes, { where: {id}, returning: true })
    return updatedUsers[0]
  },

  updatePassword:async (id:number, password:string) => {
     const [ affectedRows, updateUSers ] = await User.update({ password }, {
      where: { id },
      returning: true,
      individualHooks: true
     })
     return updateUSers[0]
  },

  getKeepWatchingList: async (id: number) => {
    const userWithWatchingEpisodes = await User.findByPk(id, {
      include: {
        association: 'Episodes',
        attributes: [
          'id',
          'name',
          'synopsis',
          'order',
          ['video_url', 'videoUrl'],
          ['seconds_long', 'secondsLong'],
          ['course_id', 'courseId']
        ],
        include: [{
          association: 'Course',
          attributes: [
            'id',
            'name',
            'synopsis',
            ['thumbnail_url', 'thumbnailUrl']
          ],
          as: 'course'
        }],
        through: {
          as: 'watchTime',
          attributes: [
            'seconds',
            ['updated_at', 'updatedAt']
          ]
        }
      }
    })

    if (!userWithWatchingEpisodes) throw new Error('Usuário não encontrado.')

    const keepWatchingList = filterLastEpisodesByCourse(userWithWatchingEpisodes.Episodes!)
    // @ts-ignore
    keepWatchingList.sort((a, b) => b.watchTime?.updatedAt - a.watchTime.updatedAt)
    return keepWatchingList
  }
}