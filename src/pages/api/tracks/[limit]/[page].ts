import HttpStatus from 'http-status-codes';
import { NextApiRequest, NextApiResponse } from 'next';
import { signIn } from '../../../../server/spotify-api';

const MAX_LIMIT = 50;

function parseQuery(query: string | string[]): number {
  if (typeof query !== 'string') {
    throw new Error(`Invalid query (${query})!`);
  }
  return parseInt(query, 10);
}

/**
 * Returns the user's saved tracks.
 * @param req The request.
 * @param res The response.
 */
export default async function (
  req: NextApiRequest,
  res: NextApiResponse,
): Promise<void> {
  const { query } = req;
  try {
    const limit = parseQuery(query.limit);
    if (limit > MAX_LIMIT) {
      throw new Error(`limit (${limit}) cannot be greater than ${MAX_LIMIT}!`);
    } else if (limit <= 0) {
      throw new Error(`limit (${limit}) cannot be less than or equal to 0!`);
    }

    const page = parseQuery(query.page);
    if (page < 0) {
      throw new Error(`page (${page}) cannot be less than 0!`);
    }

    const spotifyApi = await signIn(req);
    const tracks = (
      await spotifyApi.getMySavedTracks({
        limit,
        offset: page * limit,
      })
    ).body;
    res.json(tracks);
  } catch (error) {
    res.status(HttpStatus.BAD_REQUEST).json(error);
  }
}
