export default function mainContributorName (input) {
  let name = ''
  if (input) {
    input.forEach(contributor => {
      if (contributor.type.includes('MainEntry')) {
        name = contributor.agent.name
      }
    })
  }
  return name
}
