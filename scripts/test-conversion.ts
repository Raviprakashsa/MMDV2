import connectDB from '@/lib/db/mongodb'
import Candidate from '@/lib/db/models/Candidate'

async function test() {
	await connectDB()

	const allCandidates = await Candidate.aggregate([
		{ $group: { _id: '$status', count: { $sum: 1 } } },
	])
	console.log('All candidates:', allCandidates)

	const monthlyCandidates = await Candidate.aggregate([
		{
			$match: {
				appliedAt: {
					$gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
				},
			},
		},
		{ $group: { _id: '$status', count: { $sum: 1 } } },
	])
	console.log('Monthly candidates:', monthlyCandidates)
}

test()
	.then(() => process.exit(0))
	.catch((error) => {
		console.error(error)
		process.exit(1)
	})
