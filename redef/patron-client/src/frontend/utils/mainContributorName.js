export default function mainContributorName (input) {
  let name = ''
  if (input) {
    input.filter(c => c.type).forEach(contributor => {
      if (contributor.type.includes('MainEntry')) {
        name = contributor.agent.name
      }
    })
  }
  return name
}
