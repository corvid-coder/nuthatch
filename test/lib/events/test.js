import { Events } from "/events.js"

function pop (data) {
  console.log(`pop! ${JSON.stringify(data)}`)
}
function kaboom (data) {
  console.log(`kaboom! ${JSON.stringify(data)}`)
}

const events = new Events()
events.on("test", pop)
events.on("explode", kaboom)
events.trigger("test", [1, 2, 3])
events.trigger("explode", "KABLOOIE")
events.trigger("test", {foo: "bar"})
events.off("explode", kaboom)
events.trigger("explode", "NO KABLOOIE")
events.on("explode", kaboom)
events.trigger("explode", "PLEASE KABLOOIE")
