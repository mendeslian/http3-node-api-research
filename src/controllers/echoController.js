import { z } from 'zod';

const EchoBodySchema = z.object({
  message: z.string().min(1),
});

async function echo(req, res) {
  const body = EchoBodySchema.parse(req.body);
  res.json({ echo: body.message });
}

export { echo };
